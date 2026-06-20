import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") ?? session.user.role
  const scope = searchParams.get("scope")

  const whereBase: Prisma.BookingWhereInput = role === "teacher"
    ? { teacherId: profile.id }
    : { studentId: profile.id }

  const now = new Date()

  const expiredBookings = await prisma.booking.findMany({
    where: {
      ...whereBase,
      startsAt: { not: null, lte: now },
      status: { in: ["confirmed"] },
    },
    select: { id: true, startsAt: true, durationMinutes: true },
  })

  for (const b of expiredBookings) {
    if (b.startsAt) {
      const endTime = new Date(b.startsAt.getTime() + b.durationMinutes * 60000)
      if (endTime < now) {
        await prisma.booking.update({
          where: { id: b.id },
          data: { status: "completed", endedAt: now },
        })
      }
    }
  }

  let where: Prisma.BookingWhereInput = whereBase

  if (scope === "upcoming") {
    where = {
      ...whereBase,
      status: { in: ["pending", "confirmed", "in_progress"] },
    }
  } else if (scope === "past") {
    where = {
      ...whereBase,
      status: { in: ["completed", "cancelled", "disputed"] },
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      student: { select: { id: true, displayName: true, avatarUrl: true } },
      teacher: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    orderBy: scope === "past" ? { createdAt: "desc" } : { startsAt: { sort: "asc", nulls: "last" } },
  })

  return NextResponse.json(bookings.map((b) => ({
    ...b,
    amountInr: b.amountInr ? Number(b.amountInr) : null,
    platformFeeInr: b.platformFeeInr ? Number(b.platformFeeInr) : null,
    teacherPayoutInr: b.teacherPayoutInr ? Number(b.teacherPayoutInr) : null,
  })))
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  try {
    const { teacherId, subject, doubtContext, sessionType, durationMinutes, startsAt } = await req.json()

    if (!teacherId || !subject || !sessionType || !durationMinutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const teacher = await prisma.profile.findUnique({
      where: { id: teacherId },
    })
    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "Invalid teacher" }, { status: 400 })
    }

    const rate = teacher.hourlyRateInr ? Number(teacher.hourlyRateInr) : 500
    const amountInr = Math.round((rate / 60) * durationMinutes * 100) / 100
    const platformFeeInr = Math.round(amountInr * 0.1 * 100) / 100
    const teacherPayoutInr = Math.round((amountInr - platformFeeInr) * 100) / 100

    const parsedStartsAt = startsAt ? new Date(startsAt) : null

    const booking = await prisma.booking.create({
      data: {
        studentId: profile.id,
        teacherId,
        subject,
        doubtContext: doubtContext ?? null,
        sessionType,
        durationMinutes,
        amountInr,
        platformFeeInr,
        teacherPayoutInr,
        startsAt: parsedStartsAt,
        status: "pending",
      },
    })

    if (parsedStartsAt) {
      await prisma.liveSession.updateMany({
        where: { bookingId: booking.id },
        data: { graceEndedAt: new Date(parsedStartsAt.getTime() + 15 * 60000) },
      })
    }

    await prisma.notification.create({
      data: {
        userId: teacher.id,
        title: "New Booking Request",
        body: `${profile.displayName} booked a ${durationMinutes}-minute ${sessionType} session in ${subject}.`,
        type: "booking",
      },
    })

    return NextResponse.json({
      ...booking,
      amountInr: Number(booking.amountInr),
      platformFeeInr: Number(booking.platformFeeInr),
      teacherPayoutInr: Number(booking.teacherPayoutInr),
    })
  } catch (error) {
    console.error("Booking create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
