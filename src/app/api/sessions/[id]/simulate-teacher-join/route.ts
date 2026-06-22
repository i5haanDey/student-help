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

  if (profile.id !== liveSession.booking.studentId) {
    return NextResponse.json({ error: "Only the student can simulate teacher join" }, { status: 403 })
  }

  if (liveSession.teacherJoinedAt) {
    return NextResponse.json({ error: "Teacher already joined" }, { status: 400 })
  }

  const now = new Date()

  await prisma.liveSession.update({
    where: { id },
    data: {
      teacherJoinedAt: now,
      admittedAt: now,
    },
  })

  return NextResponse.json({ success: true, teacherJoinedAt: now.toISOString(), admittedAt: now.toISOString() })
})
