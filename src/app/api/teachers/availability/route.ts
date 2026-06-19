import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile || profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  const slots = await prisma.teacherAvailabilitySlot.findMany({
    where: { teacherId: profile.id },
    orderBy: { slotStart: "asc" },
  })

  return NextResponse.json(slots)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile || profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  try {
    const { slots } = await req.json()
    const data = slots.map((s: { slotStart: string; slotEnd: string; isRecurring?: boolean }) => ({
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
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile || profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  try {
    const { id } = await req.json()

    await prisma.teacherAvailabilitySlot.deleteMany({
      where: { id, teacherId: profile.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Availability delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
