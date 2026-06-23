import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

export const GET = withAuth(async ({ params, profile }) => {
  const { id } = params

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: { booking: true },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const isTeacher = profile.id === liveSession.booking.teacherId
  const isStudent = profile.id === liveSession.booking.studentId
  if (!isTeacher && !isStudent) {
    return NextResponse.json({ error: "Not your session" }, { status: 403 })
  }

  const now = new Date()
  const graceEndedAt = liveSession.graceEndedAt
  const durationMs = liveSession.booking.durationMinutes * 60 * 1000
  const extendedMs = (liveSession.extendedByMinutes ?? 0) * 60 * 1000
  const totalDurationMs = durationMs + extendedMs

  let phase: string
  if (liveSession.endedAt) {
    phase = "post"
  } else if (liveSession.disconnectedAt) {
    phase = "disconnected"
  } else if (liveSession.actualStartAt) {
    phase = "active"
  } else if (liveSession.admittedAt && isStudent) {
    phase = "admitted"
  } else if (liveSession.teacherJoinedAt) {
    phase = isTeacher ? "waiting_for_student" : "waiting_for_admit"
  } else {
    phase = "waiting_for_teacher"
  }

  const effectiveStart = liveSession.actualStartAt ?? liveSession.teacherJoinedAt
  let remainingSeconds = 0
  if (effectiveStart) {
    const endTime = effectiveStart.getTime() + totalDurationMs
    remainingSeconds = Math.max(0, Math.floor((endTime - now.getTime()) / 1000))
  }

  let graceRemainingSeconds = 0
  if (graceEndedAt) {
    graceRemainingSeconds = Math.max(0, Math.floor((graceEndedAt.getTime() - now.getTime()) / 1000))
  }

  const graceExpired = !!graceEndedAt && now > graceEndedAt && !liveSession.teacherJoinedAt

  return NextResponse.json({
    phase,
    teacherJoined: !!liveSession.teacherJoinedAt,
    studentJoined: !!liveSession.studentJoinedAt,
    admitted: !!liveSession.admittedAt,
    actualStartAt: liveSession.actualStartAt?.toISOString() ?? null,
    remainingSeconds,
    graceRemainingSeconds,
    graceExpired,
    disconnectedAt: liveSession.disconnectedAt?.toISOString() ?? null,
    extensionStatus: liveSession.extensionStatus,
    extensionRequestedBy: liveSession.extensionRequestedBy,
    extensionRequestedMin: liveSession.extensionRequestedMin,
    extensionExpiresAt: liveSession.extensionExpiresAt?.toISOString() ?? null,
  })
})
