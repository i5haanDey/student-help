import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

export const POST = withAuth(async ({ params, profile }) => {
  const { id } = await Promise.resolve(params)

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

  if (isTeacher) {
    await prisma.liveSession.update({
      where: { id },
      data: {
        teacherJoinedAt: liveSession.teacherJoinedAt ?? now,
        disconnectedAt: null,
      },
    })
  }

  if (isStudent) {
    if (!liveSession.admittedAt) {
      return NextResponse.json({ error: "Teacher has not admitted you yet" }, { status: 403 })
    }

    await prisma.liveSession.update({
      where: { id },
      data: {
        studentJoinedAt: liveSession.studentJoinedAt ?? now,
        actualStartAt: liveSession.actualStartAt ?? now,
        disconnectedAt: null,
        booking: {
          update: { status: "in_progress" },
        },
      },
    })
  }

  return NextResponse.json({ success: true })
})
