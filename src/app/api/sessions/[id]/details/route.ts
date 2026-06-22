import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

export const GET = withAuth(async ({ params, profile }) => {
  const { id } = params

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          student: { select: { id: true, displayName: true, avatarUrl: true } },
          teacher: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
      chatMessages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, senderId: true, messageText: true, createdAt: true },
      },
      practiceSets: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      ratings: {
        take: 1,
      },
    },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const isStudent = liveSession.booking.studentId === profile.id
  const isTeacher = liveSession.booking.teacherId === profile.id
  const isAdmin = profile.role === "admin"

  if (!isStudent && !isTeacher && !isAdmin) {
    return NextResponse.json({ error: "Not your session" }, { status: 403 })
  }

  let totalActualDuration = 0
  if (liveSession.actualStartAt && liveSession.endedAt) {
    totalActualDuration = Math.round(
      (liveSession.endedAt.getTime() - liveSession.actualStartAt.getTime()) / 60000
    )
  }

  return NextResponse.json({
    booking: {
      ...liveSession.booking,
      amountInr: liveSession.booking.amountInr ? Number(liveSession.booking.amountInr) : null,
    },
    liveSession: {
      ...liveSession,
      whiteboardState: liveSession.whiteboardState,
    },
    chatMessages: liveSession.chatMessages,
    practiceSet: liveSession.practiceSets[0] ?? null,
    rating: liveSession.ratings[0] ?? null,
    totalActualDuration,
  })
})
