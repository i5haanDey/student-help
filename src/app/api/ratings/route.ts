import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile || profile.role !== "student") {
    return NextResponse.json({ error: "Only students can rate" }, { status: 403 })
  }

  try {
    const { sessionId, stars, comment } = await req.json()

    if (!sessionId || !stars || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

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

    const rating = await prisma.rating.create({
      data: {
        sessionId,
        studentId: profile.id,
        teacherId: liveSession.booking.teacherId,
        stars,
        comment: comment ?? null,
      },
    })

    await prisma.notification.create({
      data: {
        userId: liveSession.booking.teacherId,
        title: "New Rating Received",
        body: `You received a ${stars}-star rating!`,
        type: "rating",
      },
    })

    return NextResponse.json(rating)
  } catch (error) {
    console.error("Rating error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
