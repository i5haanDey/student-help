import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSession = await auth()
  if (!sessionSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: { booking: true },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const now = new Date()

  await prisma.liveSession.update({
    where: { id },
    data: { endedAt: now },
  })

  await prisma.booking.update({
    where: { id: liveSession.bookingId },
    data: { status: "completed", endedAt: now },
  })

  return NextResponse.json({ success: true, endedAt: now.toISOString() })
}
