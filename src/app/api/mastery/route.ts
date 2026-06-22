import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { MasteryUpdateSchema } from "@/lib/validators"

export const GET = withAuth(async ({ profile }) => {
  const scores = await prisma.masteryScore.findMany({
    where: { studentId: profile.id },
    orderBy: { lastUpdated: "desc" },
  })

  const sessionsCompleted = await prisma.booking.count({
    where: { studentId: profile.id, status: "completed" },
  })

  const doubtsSolved = await prisma.aiDoubtSubmission.count({
    where: { studentId: profile.id },
  })

  return NextResponse.json({
    overall: scores.length > 0
      ? Number(scores.reduce((s, m) => s + Number(m.score), 0) / scores.length).toFixed(1)
      : 0,
    subjects: scores.map((s) => ({
      subject: s.subject,
      score: Number(s.score),
      sessionCount: s.sessionCount,
      practiceCount: s.practiceCount,
      lastUpdated: s.lastUpdated.toISOString(),
    })),
    stats: {
      sessionsCompleted,
      doubtsSolved,
      totalSubjects: scores.length,
    },
  })
})

export const POST = withAuth(async ({ req, profile }) => {
  try {
    const { subject, practiceScore } = MasteryUpdateSchema.parse(await req.json())

    const existing = await prisma.masteryScore.findUnique({
      where: { studentId_subject: { studentId: profile.id, subject } },
    })

    const sessionsCompleted = await prisma.booking.count({
      where: { studentId: profile.id, status: "completed" },
    })

    if (existing) {
      const newScore = Number(existing.score) * 0.7 + practiceScore * 0.3
      const updated = await prisma.masteryScore.update({
        where: { id: existing.id },
        data: {
          score: Math.round(newScore * 100) / 100,
          sessionCount: sessionsCompleted,
          practiceCount: existing.practiceCount + 1,
        },
      })
      return NextResponse.json(updated)
    }

    const created = await prisma.masteryScore.create({
      data: {
        studentId: profile.id,
        subject,
        score: Math.round(practiceScore * 100) / 100,
        sessionCount: sessionsCompleted,
        practiceCount: 1,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error("Mastery update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
