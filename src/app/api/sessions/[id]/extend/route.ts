import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { ExtensionRequestSchema, ExtensionActionSchema } from "@/lib/validators"

const EXTENSION_RESPONSE_TIMEOUT_MS = 3 * 60 * 1000

export const POST = withAuth(async ({ req, params, profile }) => {
  const { id } = params

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          teacher: { select: { displayName: true, hourlyRateInr: true } },
        },
      },
    },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  if (profile.id !== liveSession.booking.studentId) {
    return NextResponse.json({ error: "Only students can request extension" }, { status: 403 })
  }

  if (liveSession.extensionStatus !== "none" && liveSession.extensionStatus !== "denied") {
    return NextResponse.json({ error: "Extension already requested" }, { status: 409 })
  }

  const { requestedMinutes } = ExtensionRequestSchema.parse(await req.json())

  const freeMinutes = Math.min(requestedMinutes, 10)
  const paidMinutes = Math.max(0, requestedMinutes - freeMinutes)
  const hourlyRate = liveSession.booking.teacher.hourlyRateInr
    ? Number(liveSession.booking.teacher.hourlyRateInr)
    : 500
  const cost = Math.round((hourlyRate / 60) * paidMinutes * 100) / 100

  const expiresAt = new Date(Date.now() + EXTENSION_RESPONSE_TIMEOUT_MS)

  await prisma.$transaction([
    prisma.liveSession.update({
      where: { id },
      data: {
        extensionRequestedBy: profile.id,
        extensionRequestedMin: requestedMinutes,
        extensionStatus: "pending",
        extensionExpiresAt: expiresAt,
      },
    }),
    prisma.notification.create({
      data: {
        userId: liveSession.booking.teacherId,
        title: "Extension Request",
        body: `${profile.displayName} wants to extend by ${requestedMinutes} min (First 10 free, ₹${cost} for ${paidMinutes} min).`,
        type: "extension",
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    freeMinutes,
    paidMinutes,
    cost,
    expiresAt: expiresAt.toISOString(),
  })
})

export const PATCH = withAuth(async ({ req, params, profile }) => {
  const { id } = params

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

  const { action } = ExtensionActionSchema.parse(await req.json())

  if (action === "accept") {
    const added = liveSession.extensionRequestedMin ?? 0
    const current = liveSession.extendedByMinutes ?? 0

    await prisma.$transaction([
      prisma.liveSession.update({
        where: { id },
        data: {
          extensionStatus: "accepted",
          extendedByMinutes: current + added,
        },
      }),
      prisma.notification.create({
        data: {
          userId: liveSession.booking.studentId,
          title: "Extension Accepted",
          body: `Teacher accepted your ${added}-minute extension request.`,
          type: "extension",
        },
      }),
    ])

    return NextResponse.json({ success: true, extendedByMinutes: current + added })
  }

  await prisma.$transaction([
    prisma.liveSession.update({
      where: { id },
      data: { extensionStatus: "denied" },
    }),
    prisma.notification.create({
      data: {
        userId: liveSession.booking.studentId,
        title: "Extension Denied",
        body: "Teacher declined the extension request. Session will end on time.",
        type: "extension",
      },
    }),
  ])

  return NextResponse.json({ success: true, extensionStatus: "denied" })
})
