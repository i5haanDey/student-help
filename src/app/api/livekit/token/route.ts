import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { LiveKitTokenSchema } from "@/lib/validators"

export const POST = withAuth(async ({ req, profile }) => {
  try {
    const { roomName } = LiveKitTokenSchema.parse(await req.json())

    const bookingId = roomName.replace("room_", "")
    if (!bookingId || bookingId === roomName) {
      return NextResponse.json({ error: "Invalid room name" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { studentId: true, teacherId: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (profile.id !== booking.studentId && profile.id !== booking.teacherId && profile.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to join this session" }, { status: 403 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: "LiveKit not configured" }, { status: 500 })
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: profile.id,
      name: profile.displayName,
      metadata: JSON.stringify({ role: profile.role, avatarUrl: profile.avatarUrl }),
    })

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()

    return NextResponse.json({ token, url: livekitUrl, roomName })
  } catch (error) {
    console.error("LiveKit token error:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
})
