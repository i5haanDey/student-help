import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { AvailabilityCreateSchema, AvailabilityDeleteSchema } from "@/lib/validators"

export const GET = withAuth(async ({ profile }) => {
  if (profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  const slots = await prisma.teacherAvailabilitySlot.findMany({
    where: { teacherId: profile.id },
    orderBy: { slotStart: "asc" },
  })

  return NextResponse.json(slots)
}, { role: "teacher" })

export const POST = withAuth(async ({ req, profile }) => {
  if (profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  try {
    const { slots } = AvailabilityCreateSchema.parse(await req.json())
    const data = slots.map((s) => ({
      teacherId: profile.id,
      slotStart: new Date(s.slotStart),
      slotEnd: new Date(s.slotEnd),
      isRecurring: s.isRecurring ?? false,
    }))

    await prisma.teacherAvailabilitySlot.createMany({ data })

    return NextResponse.json({ success: true, count: data.length })
  } catch (error) {
    console.error("Availability create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, { role: "teacher" })

export const DELETE = withAuth(async ({ req, profile }) => {
  if (profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  try {
    const { id } = AvailabilityDeleteSchema.parse(await req.json())

    await prisma.teacherAvailabilitySlot.deleteMany({
      where: { id, teacherId: profile.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Availability delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, { role: "teacher" })
