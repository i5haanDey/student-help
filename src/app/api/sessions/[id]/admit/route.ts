import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(
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
    include: { booking: { include: { student: true } } },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  if (profile.id !== liveSession.booking.teacherId) {
    return NextResponse.json({ error: "Only the teacher can admit students" }, { status: 403 })
  }

  const now = new Date()

  await prisma.liveSession.update({
    where: { id },
    data: { admittedAt: now },
  })

  await prisma.notification.create({
    data: {
      userId: liveSession.booking.studentId,
      title: "Session Ready",
      body: `Your session with ${profile.displayName} is ready! Join now.`,
      type: "session",
    },
  })

  return NextResponse.json({ success: true, admittedAt: now.toISOString() })
}
