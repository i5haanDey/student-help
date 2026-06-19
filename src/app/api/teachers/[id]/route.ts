import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const teacher = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        subjects: true,
        teachingLanguages: true,
        hourlyRateInr: true,
        verificationStatus: true,
        compositeScore: true,
        totalSessions: true,
        isAvailableNow: true,
        rank: true,
        availabilitySlots: {
          where: { isBooked: false, slotStart: { gte: new Date() } },
          orderBy: { slotStart: "asc" },
          take: 20,
        },
        ratingsReceived: {
          select: { stars: true, comment: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!teacher || teacher.verificationStatus !== "approved") {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...teacher,
      hourlyRateInr: teacher.hourlyRateInr ? Number(teacher.hourlyRateInr) : null,
      compositeScore: teacher.compositeScore ? Number(teacher.compositeScore) : 0,
    })
  } catch (error) {
    console.error("Teacher fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
