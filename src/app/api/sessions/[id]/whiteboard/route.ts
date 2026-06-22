import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

export const GET = withAuth(async ({ params }) => {
  const { id } = params

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    select: { whiteboardState: true },
  })

  return NextResponse.json({ snapshot: liveSession?.whiteboardState ?? null })
})

export const PUT = withAuth(async ({ req, params }) => {
  const { id } = params
  const { snapshot } = await req.json()

  await prisma.liveSession.update({
    where: { id },
    data: { whiteboardState: snapshot },
  })

  return NextResponse.json({ success: true })
})
