import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { calculatePricing } from "@/services/pricing"
import { DEFAULT_HOURLY_RATE, GRACE_PERIOD_MS } from "@/services/pricing"
import type { Prisma } from "@/generated/prisma/client"

export const GET = withAuth(async ({ req, profile, session }) => {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") ?? session.user.role
  const scope = searchParams.get("scope")

  const whereBase: Prisma.BookingWhereInput = role === "teacher"
    ? { teacherId: profile.id }
    : { studentId: profile.id }

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
})

export const POST = withAuth(async ({ req, profile }) => {
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

    const rate = teacher.hourlyRateInr ? Number(teacher.hourlyRateInr) : DEFAULT_HOURLY_RATE
    const { amountInr, platformFeeInr, teacherPayoutInr } = calculatePricing(rate, durationMinutes)

    const parsedStartsAt = startsAt ? new Date(startsAt) : null

    const [booking] = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
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
        await tx.liveSession.updateMany({
          where: { bookingId: b.id },
          data: { graceEndedAt: new Date(parsedStartsAt.getTime() + GRACE_PERIOD_MS) },
        })
      }

      await tx.notification.create({
        data: {
          userId: teacher.id,
          title: "New Booking Request",
          body: `${profile.displayName} booked a ${durationMinutes}-minute ${sessionType} session in ${subject}.`,
          type: "booking",
        },
      })

      return [b]
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
})
