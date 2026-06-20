import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSession = await auth()
  if (!sessionSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: { booking: { include: { teacher: true } } },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

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
  const scheduledDurationMs = booking.durationMinutes * 60000
  const payRatio = Math.min(1, totalActualMs / Math.max(scheduledDurationMs, 1))
  const finalPayout = Math.round(originalPayout * payRatio * 100) / 100
  const refundAmount = Math.round((originalPayout - finalPayout) * 100) / 100

  await prisma.liveSession.update({
    where: { id },
    data: { endedAt: now },
  })

  await prisma.booking.update({
    where: { id: liveSession.bookingId },
    data: {
      status: "completed",
      endedAt: now,
      teacherPayoutInr: finalPayout,
    },
  })

  await prisma.notification.create({
    data: {
      userId: booking.studentId,
      title: "Session Completed",
      body: `Your session has ended. Check the summary and rate your teacher.`,
      type: "session",
    },
  })

  await prisma.notification.create({
    data: {
      userId: booking.teacherId,
      title: "Session Completed",
      body: `Session ended. View your earnings and summary.`,
      type: "session",
    },
  })

  return NextResponse.json({
    success: true,
    endedAt: now.toISOString(),
    teacherPayout: finalPayout,
    refundToStudent: refundAmount,
  })
}
