import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { Prisma } from "@/generated/prisma/client"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get("subject")
  const language = searchParams.get("language")
  const maxRate = searchParams.get("maxRate")
  const available = searchParams.get("available")
  const search = searchParams.get("search")

  const where: Prisma.ProfileWhereInput = {
    role: "teacher",
    verificationStatus: "approved",
  }

  if (search) {
    where.displayName = { contains: search, mode: "insensitive" }
  }

  if (subject) {
    where.subjects = { has: subject }
  }

  if (language) {
    where.teachingLanguages = { has: language }
  }

  if (maxRate) {
    where.hourlyRateInr = { lte: Number(maxRate) }
  }

  if (available === "true") {
    where.isAvailableNow = true
  }

  try {
    const teachers = await prisma.profile.findMany({
      where,
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
      },
      orderBy: { compositeScore: "desc" },
    })

    return NextResponse.json(teachers.map((t) => ({
      ...t,
      hourlyRateInr: t.hourlyRateInr ? Number(t.hourlyRateInr) : null,
      compositeScore: t.compositeScore ? Number(t.compositeScore) : 0,
    })))
  } catch (error) {
    console.error("Teachers fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
