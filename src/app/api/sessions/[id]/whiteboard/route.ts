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

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    select: { whiteboardState: true },
  })

  if (!liveSession) {
    return NextResponse.json({ snapshot: null })
  }

  return NextResponse.json({ snapshot: liveSession.whiteboardState })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { snapshot } = await req.json()

  await prisma.liveSession.update({
    where: { id },
    data: { whiteboardState: snapshot },
  })

  return NextResponse.json({ success: true })
}
