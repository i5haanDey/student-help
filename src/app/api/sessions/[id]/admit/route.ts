import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

export const POST = withAuth(async ({ params, profile }) => {
  const { id } = params

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: { booking: { include: { student: true } } },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  if (profile.id !== liveSession.booking.teacherId) {
    return NextResponse.json({ error: "Only the teacher can admit students" }, { status: 403 })
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.liveSession.update({
      where: { id },
      data: { admittedAt: now },
    }),
    prisma.notification.create({
      data: {
        userId: liveSession.booking.studentId,
        title: "Session Ready",
        body: `Your session with ${profile.displayName} is ready! Join now.`,
        type: "session",
      },
    }),
  ])

  return NextResponse.json({ success: true, admittedAt: now.toISOString() })
})
