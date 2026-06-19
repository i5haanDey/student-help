import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { TeacherDashboardClient } from "@/components/dashboard/teacher-dashboard-client"

export const metadata: Metadata = {
  title: "Teacher Dashboard - Student Help",
  description: "Manage your teaching activity, schedule, and earnings.",
}

function getWeekLabel(date: Date): string {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const month = startOfWeek.toLocaleString("en-US", { month: "short" })
  const day = startOfWeek.getDate()
  return `${month} ${day}`
}

export default async function TeacherDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "teacher") redirect(`/${session.user.role}`)

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile?.subjects?.length) {
    redirect("/onboarding/teacher")
  }

  const now = new Date()

  const [completedSessions, pendingSessions, cancelledSessions, completedBookings, upcomingBookings, allCompletedBookings, ratings, distinctStudents] = await Promise.all([
    prisma.booking.count({ where: { teacherId: profile.id, status: "completed" } }),
    prisma.booking.count({ where: { teacherId: profile.id, status: "pending" } }),
    prisma.booking.count({ where: { teacherId: profile.id, status: "cancelled" } }),
    prisma.booking.findMany({
      where: { teacherId: profile.id, status: "completed" },
      select: { teacherPayoutInr: true, subject: true, createdAt: true, studentId: true },
    }),
    prisma.booking.findMany({
      where: { teacherId: profile.id, startsAt: { gte: now }, status: { not: "cancelled" } },
      orderBy: { startsAt: "asc" },
      take: 10,
      select: { id: true, subject: true, startsAt: true, durationMinutes: true, student: { select: { displayName: true } } },
    }),
    prisma.booking.findMany({
      where: { teacherId: profile.id, status: "completed" },
      select: { teacherPayoutInr: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.rating.findMany({
      where: { teacherId: profile.id },
      select: { stars: true },
    }),
    prisma.booking.groupBy({
      by: ["studentId"],
      where: { teacherId: profile.id },
    }),
  ])

  const totalEarnings = completedBookings.reduce((sum, b) => sum + Number(b.teacherPayoutInr ?? 0), 0)
  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length : 0

  const subjectCounts: Record<string, number> = {}
  for (const b of completedBookings) {
    subjectCounts[b.subject] = (subjectCounts[b.subject] ?? 0) + 1
  }
  const subjectDistribution = Object.entries(subjectCounts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const weekMap: Record<string, number> = {}
  const eightWeeksAgo = new Date(now)
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

  for (const b of allCompletedBookings) {
    if (b.createdAt < eightWeeksAgo) continue
    const label = getWeekLabel(b.createdAt)
    weekMap[label] = (weekMap[label] ?? 0) + Number(b.teacherPayoutInr ?? 0)
  }

  const weeklyEarnings = Object.entries(weekMap)
    .map(([week, amount]) => ({ week, amount }))
    .sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const aParts = a.week.split(" ")
      const bParts = b.week.split(" ")
      const aMonth = months.indexOf(aParts[0])
      const bMonth = months.indexOf(bParts[0])
      if (aMonth !== bMonth) return aMonth - bMonth
      return Number.parseInt(aParts[1]) - Number.parseInt(bParts[1])
    })

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <TeacherDashboardClient
        data={{
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          verificationStatus: profile.verificationStatus,
          totalEarnings,
          pendingPayout: Number(profile.earningsPending ?? 0),
          completedSessions,
          pendingSessions,
          cancelledSessions,
          totalStudents: distinctStudents.length,
          avgRating,
          ratingCount: ratings.length,
          weeklyEarnings,
          upcomingSessions: upcomingBookings.map((b) => ({
            id: b.id,
            subject: b.subject,
            studentName: b.student.displayName,
            startsAt: b.startsAt?.toISOString() ?? "",
            durationMinutes: b.durationMinutes,
          })),
          subjectDistribution,
        }}
      />
    </div>
  )
}
