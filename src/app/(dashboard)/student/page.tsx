import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { StudentDashboardClient } from "@/components/dashboard/student-dashboard-client"

export const metadata: Metadata = {
  title: "Student Dashboard - Student Help",
  description: "Your learning overview, sessions, and progress.",
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default async function StudentDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile?.gradeLevel) {
    redirect("/onboarding/student")
  }

  const [sessionsCompleted, doubtsSolved, masteryAgg, practiceSetsCount, subjectScores, recentDoubts, recentSessions, recentPractice] = await Promise.all([
    prisma.booking.count({ where: { studentId: profile.id, status: "completed" } }),
    prisma.aiDoubtSubmission.count({ where: { studentId: profile.id } }),
    prisma.masteryScore.aggregate({ where: { studentId: profile.id }, _avg: { score: true } }),
    prisma.practiceSet.count({ where: { studentId: profile.id } }),
    prisma.masteryScore.findMany({
      where: { studentId: profile.id },
      orderBy: { score: "desc" },
      take: 4,
    }),
    prisma.aiDoubtSubmission.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, inputText: true, confidenceLevel: true, createdAt: true },
    }),
    prisma.booking.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, subject: true, status: true, createdAt: true },
    }),
    prisma.practiceSet.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, subject: true, status: true, createdAt: true },
    }),
  ])

  const activityItems = [
    ...recentDoubts.map((d) => ({
      id: `doubt-${d.id}`,
      createdAt: d.createdAt,
      type: "doubt" as const,
      title: d.inputText ? d.inputText.slice(0, 80) + (d.inputText.length > 80 ? "..." : "") : "Image doubt",
      subtitle: "AI Doubt Solver",
      status: d.confidenceLevel ?? "pending",
    })),
    ...recentSessions.map((b) => ({
      id: `session-${b.id}`,
      createdAt: b.createdAt,
      type: "session" as const,
      title: `${b.subject} Session`,
      subtitle: "Tutoring session",
      status: b.status,
    })),
    ...recentPractice.map((p) => ({
      id: `practice-${p.id}`,
      createdAt: p.createdAt,
      type: "practice" as const,
      title: `${p.subject} Practice`,
      subtitle: "Practice set",
      status: p.status === "completed" ? "completed" : "pending",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6)
    .map(({ createdAt, ...item }) => ({
      ...item,
      timeAgo: timeAgo(createdAt),
    }))

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <StudentDashboardClient
        data={{
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          sessionsCompleted,
          doubtsSolved,
          avgMasteryScore: masteryAgg._avg.score ? Number(masteryAgg._avg.score) : 0,
          practiceSetsCompleted: practiceSetsCount,
          subjectScores: subjectScores.map((s) => ({ subject: s.subject, score: Number(s.score) })),
          recentActivity: activityItems,
        }}
      />
    </div>
  )
}
