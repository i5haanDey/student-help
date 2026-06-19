import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AdminDashboardClient } from "@/components/dashboard/admin-dashboard-client"

export const metadata: Metadata = {
  title: "Admin Dashboard - Student Help",
  description: "Platform overview and management dashboard.",
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") redirect(`/${session.user.role}`)

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const [
    totalUsers, totalTeachers, totalStudents,
    pendingVerifications, totalSessions, disputedSessions,
    revenueAgg, recentUsers, teacherVerifications,
    recentBookings, topTeacherData,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.user.count({ where: { role: "student" } }),
    prisma.profile.count({ where: { verificationStatus: { in: ["pending", "under_review"] } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "disputed" } }),
    prisma.booking.aggregate({ where: { status: "completed" }, _sum: { platformFeeInr: true } }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, role: true },
    }),
    prisma.profile.groupBy({
      by: ["verificationStatus"],
      where: { role: "teacher" },
      _count: true,
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.booking.groupBy({
      by: ["teacherId"],
      where: { status: "completed" },
      _count: true,
      orderBy: { _count: { teacherId: "desc" } },
      take: 5,
    }),
  ])

  const allDays: string[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i)
    allDays.push(d.toISOString().slice(0, 10))
  }

  let userCount = 0
  let teacherCount = 0
  const dayTotals: Record<string, { users: number; teachers: number }> = {}
  for (const d of allDays) dayTotals[d] = { users: 0, teachers: 0 }

  for (const u of recentUsers) {
    const key = u.createdAt.toISOString().slice(0, 10)
    if (dayTotals[key]) {
      dayTotals[key].users++
      if (u.role === "teacher") dayTotals[key].teachers++
    }
  }

  const growthData = allDays.map((date) => {
    const add = dayTotals[date]
    userCount += add.users
    teacherCount += add.teachers
    return { date: date.slice(5), users: userCount, teachers: teacherCount }
  })

  const verifMap: Record<string, number> = { pending: 0, under_review: 0, approved: 0, rejected: 0 }
  for (const v of teacherVerifications) {
    verifMap[v.verificationStatus] = v._count
  }

  const verificationFunnel = [
    { name: "Pending", count: verifMap.pending + verifMap.under_review, color: "hsl(var(--chart-3))" },
    { name: "Approved", count: verifMap.approved, color: "hsl(var(--chart-2))" },
    { name: "Rejected", count: verifMap.rejected, color: "hsl(var(--chart-5))" },
  ]

  const sessionDayCounts: Record<string, number> = {}
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo)
    d.setDate(d.getDate() + i)
    sessionDayCounts[d.toISOString().slice(0, 10)] = 0
  }
  for (const b of recentBookings) {
    const key = b.createdAt.toISOString().slice(0, 10)
    if (sessionDayCounts[key] !== undefined) sessionDayCounts[key]++
  }
  const sessionVolume = Object.entries(sessionDayCounts).map(([date, count]) => ({
    date: date.slice(5),
    count,
  }))

  const teacherIds = topTeacherData.map((t) => t.teacherId)
  const teacherProfiles = teacherIds.length > 0
    ? await prisma.profile.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, displayName: true },
    })
    : []

  const profileMap = new Map(teacherProfiles.map((p) => [p.id, p.displayName]))

  const teacherRatings = teacherIds.length > 0
    ? await prisma.rating.groupBy({
      by: ["teacherId"],
      where: { teacherId: { in: teacherIds } },
      _avg: { stars: true },
    })
    : []

  const ratingMap = new Map(teacherRatings.map((r) => [r.teacherId, Number(r._avg.stars ?? 0)]))

  const topTeachers = topTeacherData.map((t) => ({
    name: profileMap.get(t.teacherId) ?? "Unknown",
    sessions: t._count,
    rating: ratingMap.get(t.teacherId) ?? 0,
  }))

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <AdminDashboardClient
        data={{
          totalUsers,
          totalTeachers,
          totalStudents,
          pendingVerifications,
          totalSessions,
          disputedSessions,
          totalRevenue: Number(revenueAgg._sum.platformFeeInr ?? 0),
          growthData,
          verificationFunnel,
          sessionVolume,
          topTeachers,
        }}
      />
    </div>
  )
}
