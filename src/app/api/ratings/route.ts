import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { RatingCreateSchema } from "@/lib/validators"

export const POST = withAuth(async ({ req, profile }) => {
  if (profile.role !== "student") {
    return NextResponse.json({ error: "Only students can rate" }, { status: 403 })
  }

  try {
    const { sessionId, stars, comment } = RatingCreateSchema.parse(await req.json())

    const existingRating = await prisma.rating.findUnique({
      where: { sessionId },
    })
    if (existingRating) {
      return NextResponse.json({ error: "Already rated this session" }, { status: 409 })
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: { booking: true },
    })

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.rating.create({
        data: {
          sessionId,
          studentId: profile.id,
          teacherId: liveSession.booking.teacherId,
          stars,
          comment: comment ?? null,
        },
      }),
      prisma.notification.create({
        data: {
          userId: liveSession.booking.teacherId,
          title: "New Rating Received",
          body: `You received a ${stars}-star rating!`,
          type: "rating",
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Rating error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
