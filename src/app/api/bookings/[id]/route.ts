import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const includeLive = searchParams.get("include") === "liveSession"

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, displayName: true, avatarUrl: true } },
      teacher: { select: { id: true, displayName: true, avatarUrl: true } },
      liveSession: includeLive,
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (
    booking.studentId !== profile.id &&
    booking.teacherId !== profile.id
  ) {
    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Not your booking" }, { status: 403 })
    }
  }

  return NextResponse.json({
    ...booking,
    amountInr: booking.amountInr ? Number(booking.amountInr) : null,
    platformFeeInr: booking.platformFeeInr ? Number(booking.platformFeeInr) : null,
    teacherPayoutInr: booking.teacherPayoutInr ? Number(booking.teacherPayoutInr) : null,
    status: booking.status,
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  if (profile.role === "teacher" && booking.teacherId !== profile.id) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 })
  }

  const data: Prisma.BookingUpdateInput = { status }
  if (status === "completed") {
    data.endedAt = new Date()
  }

  const updated = await prisma.booking.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}
