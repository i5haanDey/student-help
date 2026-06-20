import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

const EXTENSION_RESPONSE_TIMEOUT_MS = 3 * 60 * 1000

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
    include: {
      booking: {
        include: {
          teacher: { select: { displayName: true, hourlyRateInr: true } },
          student: { select: { id: true, displayName: true } },
        },
      },
    },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  const isStudent = profile.id === liveSession.booking.studentId

  if (!isStudent) {
    return NextResponse.json({ error: "Only students can request extension" }, { status: 403 })
  }

  if (liveSession.extensionStatus !== "none" && liveSession.extensionStatus !== "denied") {
    return NextResponse.json({ error: "Extension already requested" }, { status: 409 })
  }

  const body = await req.json()
  const requestedMinutes = body.requestedMinutes as number

  if (!requestedMinutes || requestedMinutes < 1 || requestedMinutes > 30) {
    return NextResponse.json({ error: "Extension must be between 1 and 30 minutes" }, { status: 400 })
  }

  const freeMinutes = Math.min(requestedMinutes, 10)
  const paidMinutes = Math.max(0, requestedMinutes - freeMinutes)
  const hourlyRate = liveSession.booking.teacher.hourlyRateInr
    ? Number(liveSession.booking.teacher.hourlyRateInr)
    : 500
  const cost = Math.round((hourlyRate / 60) * paidMinutes * 100) / 100

  const expiresAt = new Date(Date.now() + EXTENSION_RESPONSE_TIMEOUT_MS)

  await prisma.liveSession.update({
    where: { id },
    data: {
      extensionRequestedBy: profile.id,
      extensionRequestedMin: requestedMinutes,
      extensionStatus: "pending",
      extensionExpiresAt: expiresAt,
    },
  })

  await prisma.notification.create({
    data: {
      userId: liveSession.booking.teacherId,
      title: "Extension Request",
      body: `${profile.displayName} wants to extend by ${requestedMinutes} min (First 10 free, ₹${cost} for ${paidMinutes} min).`,
      type: "extension",
    },
  })

  return NextResponse.json({
    success: true,
    freeMinutes,
    paidMinutes,
    cost,
    expiresAt: expiresAt.toISOString(),
  })
}

export async function PATCH(
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
    include: { booking: { include: { student: { select: { id: true } } } } },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  if (profile.id !== liveSession.booking.teacherId) {
    return NextResponse.json({ error: "Only the teacher can respond to extension" }, { status: 403 })
  }

  if (liveSession.extensionStatus !== "pending") {
    return NextResponse.json({ error: "No pending extension request" }, { status: 400 })
  }

  if (liveSession.extensionExpiresAt && new Date() > liveSession.extensionExpiresAt) {
    await prisma.liveSession.update({
      where: { id },
      data: { extensionStatus: "denied" },
    })
    return NextResponse.json({ error: "Extension request expired" }, { status: 408 })
  }

  const body = await req.json()
  const action = body.action as string

  if (action === "accept") {
    const added = liveSession.extensionRequestedMin ?? 0
    const current = liveSession.extendedByMinutes ?? 0

    await prisma.liveSession.update({
      where: { id },
      data: {
        extensionStatus: "accepted",
        extendedByMinutes: current + added,
      },
    })

    await prisma.notification.create({
      data: {
        userId: liveSession.booking.studentId,
        title: "Extension Accepted",
        body: `Teacher accepted your ${added}-minute extension request.`,
        type: "extension",
      },
    })

    return NextResponse.json({ success: true, extendedByMinutes: current + added })
  }

  if (action === "deny") {
    await prisma.liveSession.update({
      where: { id },
      data: { extensionStatus: "denied" },
    })

    await prisma.notification.create({
      data: {
        userId: liveSession.booking.studentId,
        title: "Extension Denied",
        body: "Teacher declined the extension request. Session will end on time.",
        type: "extension",
      },
    })

    return NextResponse.json({ success: true, extensionStatus: "denied" })
  }

  return NextResponse.json({ error: "Invalid action. Use 'accept' or 'deny'." }, { status: 400 })
}
