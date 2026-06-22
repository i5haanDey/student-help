import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

export const POST = withAuth(async ({ params, profile }) => {
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
  const data: Record<string, unknown> = { disconnectedAt: now }

  if (isTeacher && liveSession.actualStartAt) {
    const elapsed = now.getTime() - liveSession.actualStartAt.getTime()
    const prevMs = liveSession.teacherDurationMs ?? 0
    data.teacherDurationMs = prevMs + elapsed
  }

  if (isStudent && liveSession.actualStartAt) {
    const elapsed = now.getTime() - liveSession.actualStartAt.getTime()
    const prevMs = liveSession.studentDurationMs ?? 0
    data.studentDurationMs = prevMs + elapsed
  }

  await prisma.liveSession.update({
    where: { id },
    data,
  })

  return NextResponse.json({ success: true, disconnectedAt: now.toISOString() })
})
