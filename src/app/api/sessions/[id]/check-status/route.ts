import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

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
  const startsAt = liveSession.booking.startsAt
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

  let remainingSeconds = 0
  if (liveSession.actualStartAt) {
    const endTime = liveSession.actualStartAt.getTime() + totalDurationMs
    remainingSeconds = Math.max(0, Math.floor((endTime - now.getTime()) / 1000))
  }

  let graceRemainingSeconds = 0
  if (graceEndedAt) {
    graceRemainingSeconds = Math.max(0, Math.floor((graceEndedAt.getTime() - now.getTime()) / 1000))
  }

  const graceExpired = !!graceEndedAt && now > graceEndedAt && !liveSession.teacherJoinedAt

  if (liveSession.extensionStatus === "pending" && liveSession.extensionExpiresAt) {
    if (now > liveSession.extensionExpiresAt) {
      await prisma.liveSession.update({
        where: { id },
        data: { extensionStatus: "denied" },
      })
    }
  }

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
}
