import { prisma } from "@/lib/db"
import { calculateProratedPayout } from "./pricing"

export function determineSessionPhase(
  liveSession: {
    endedAt: Date | null
    disconnectedAt: Date | null
    actualStartAt: Date | null
    admittedAt: Date | null
    teacherJoinedAt: Date | null
  },
  isTeacher: boolean,
  isStudent: boolean
): string {
  if (liveSession.endedAt) return "post"
  if (liveSession.disconnectedAt) return "disconnected"
  if (liveSession.actualStartAt) return "active"
  if (liveSession.admittedAt && isStudent) return "admitted"
  if (liveSession.teacherJoinedAt) return isTeacher ? "waiting_for_student" : "waiting_for_admit"
  return "waiting_for_teacher"
}

export function calculateRemainingSeconds(
  actualStartAt: Date | null,
  durationMinutes: number,
  extendedByMinutes: number
) {
  if (!actualStartAt) return 0
  const totalMs = (durationMinutes + extendedByMinutes) * 60 * 1000
  const endTime = actualStartAt.getTime() + totalMs
  return Math.max(0, Math.floor((endTime - Date.now()) / 1000))
}

export async function endSession(id: string) {
  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: { booking: { include: { teacher: true } } },
  })

  if (!liveSession) throw new Error("Session not found")

  const now = new Date()
  const teacherDurationMs = liveSession.teacherDurationMs ?? 0
  const actualDurationMs = liveSession.actualStartAt
    ? now.getTime() - liveSession.actualStartAt.getTime()
    : 0
  const totalActualMs = Math.max(actualDurationMs, teacherDurationMs)

  if (liveSession.actualStartAt) {
    const elapsedSinceStart = now.getTime() - liveSession.actualStartAt.getTime()
    if (elapsedSinceStart > teacherDurationMs) {
      await prisma.liveSession.update({
        where: { id },
        data: {
          teacherDurationMs: teacherDurationMs + (elapsedSinceStart - teacherDurationMs),
        },
      })
    }
  }

  const booking = liveSession.booking
  const originalPayout = booking.teacherPayoutInr ? Number(booking.teacherPayoutInr) : 0
  const { finalPayout, refundAmount } = calculateProratedPayout(
    originalPayout,
    booking.durationMinutes,
    totalActualMs
  )

  await prisma.$transaction([
    prisma.liveSession.update({
      where: { id },
      data: { endedAt: now },
    }),
    prisma.booking.update({
      where: { id: liveSession.bookingId },
      data: {
        status: "completed",
        endedAt: now,
        teacherPayoutInr: finalPayout,
      },
    }),
    prisma.notification.create({
      data: {
        userId: booking.studentId,
        title: "Session Completed",
        body: "Your session has ended. Check the summary and rate your teacher.",
        type: "session",
      },
    }),
    prisma.notification.create({
      data: {
        userId: booking.teacherId,
        title: "Session Completed",
        body: "Session ended. View your earnings and summary.",
        type: "session",
      },
    }),
  ])

  return { endedAt: now, teacherPayout: finalPayout, refundToStudent: refundAmount }
}
