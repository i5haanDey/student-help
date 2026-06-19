import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: { booking: true },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Live session not found" }, { status: 404 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  if (
    liveSession.booking.studentId !== profile.id &&
    liveSession.booking.teacherId !== profile.id
  ) {
    return NextResponse.json({ error: "Not your session" }, { status: 403 })
  }

  const data: Prisma.LiveSessionUpdateInput = {}
  if (body.startedAt) data.startedAt = new Date(body.startedAt)
  if (body.endedAt) data.endedAt = new Date(body.endedAt)
  if (body.summaryText) data.summaryText = body.summaryText
  if (body.aiSummaryStatus) data.aiSummaryStatus = body.aiSummaryStatus

  const updated = await prisma.liveSession.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}
