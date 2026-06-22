import { prisma } from "@/lib/db"
import { calculatePricing } from "./pricing"

export async function expireOldBookings() {
  const now = new Date()

  const expiredBookings = await prisma.booking.findMany({
    where: {
      startsAt: { not: null, lte: now },
      status: "confirmed",
    },
    select: { id: true, startsAt: true, durationMinutes: true },
  })

  const toExpire = expiredBookings.filter((b) => {
    if (!b.startsAt) return false
    const endTime = new Date(b.startsAt.getTime() + b.durationMinutes * 60000)
    return endTime < now
  })

  if (toExpire.length === 0) return 0

  await prisma.booking.updateMany({
    where: { id: { in: toExpire.map((b) => b.id) } },
    data: { status: "completed", endedAt: now },
  })

  return toExpire.length
}

export async function createBookingWithTransaction(params: {
  studentId: string
  teacherId: string
  subject: string
  doubtContext?: string | null
  sessionType: string
  durationMinutes: number
  hourlyRate: number
  startsAt?: Date | null
}) {
  const { amountInr, platformFeeInr, teacherPayoutInr } = calculatePricing(
    params.hourlyRate,
    params.durationMinutes
  )

  const [booking] = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        studentId: params.studentId,
        teacherId: params.teacherId,
        subject: params.subject,
        doubtContext: params.doubtContext ?? null,
        sessionType: params.sessionType as "instant" | "scheduled",
        durationMinutes: params.durationMinutes,
        amountInr,
        platformFeeInr,
        teacherPayoutInr,
        startsAt: params.startsAt,
        status: "pending",
      },
    })

    if (params.startsAt) {
      const graceEndedAt = new Date(params.startsAt.getTime() + 15 * 60000)
      await tx.liveSession.updateMany({
        where: { bookingId: b.id },
        data: { graceEndedAt },
      })
    }

    return [b]
  })

  return booking
}

