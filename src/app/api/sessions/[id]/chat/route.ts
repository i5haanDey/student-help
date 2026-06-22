import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { ChatMessageSchema } from "@/lib/validators"

export const GET = withAuth(async ({ params }) => {
  const { id } = params

  const messages = await prisma.sessionChatMessage.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  return NextResponse.json(messages)
})

export const POST = withAuth(async ({ req, params, profile }) => {
  const { id } = params
  const { messageText } = ChatMessageSchema.parse(await req.json())

  const contactRegex = /[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d{10,15}/g
  if (contactRegex.test(messageText)) {
    return NextResponse.json({ error: "Sharing contact info is not allowed" }, { status: 400 })
  }

  const msg = await prisma.sessionChatMessage.create({
    data: {
      sessionId: id,
      senderId: profile.id,
      messageText,
    },
  })

  return NextResponse.json(msg)
})
