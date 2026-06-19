import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const messages = await prisma.sessionChatMessage.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  return NextResponse.json(messages)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const { id } = await params
  const { messageText } = await req.json()

  if (!messageText?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const contactRegex = /[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d{10,15}/g
  if (contactRegex.test(messageText)) {
    return NextResponse.json({ error: "Sharing contact info is not allowed" }, { status: 400 })
  }

  const msg = await prisma.sessionChatMessage.create({
    data: {
      sessionId: id,
      senderId: profile.id,
      messageText: messageText.trim(),
    },
  })

  return NextResponse.json(msg)
}
