"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { DollarSign, BookOpen, Clock, Star, TrendingUp, Users, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { GreetingHeader } from "@/components/dashboard/greeting-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WeeklyEarning {
  week: string
  amount: number
}

interface UpcomingSession {
  id: string
  subject: string
  studentName: string
  startsAt: string
  durationMinutes: number
}

interface SubjectCount {
  subject: string
  count: number
}

interface TeacherDashboardData {
  displayName: string
  avatarUrl: string | null
  verificationStatus: string
  totalEarnings: number
  pendingPayout: number
  completedSessions: number
  pendingSessions: number
  cancelledSessions: number
  totalStudents: number
  avgRating: number
  ratingCount: number
  weeklyEarnings: WeeklyEarning[]
  upcomingSessions: UpcomingSession[]
  subjectDistribution: SubjectCount[]
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours < 0) return "Overdue"
  if (hours < 1) return `in ${minutes}m`
  if (hours < 24) return `in ${hours}h`
  if (hours < 48) return "Tomorrow"
  return d.toLocaleDateString()
}

export function TeacherDashboardClient({ data }: { data: TeacherDashboardData }) {
  const sessionData = [
    { name: "Completed", value: data.completedSessions, color: "hsl(var(--chart-2))" },
    { name: "Pending", value: data.pendingSessions, color: "hsl(var(--chart-3))" },
    { name: "Cancelled", value: data.cancelledSessions, color: "hsl(var(--chart-5))" },
  ].filter((d) => d.value > 0)

  const avgRating = Math.round(data.avgRating * 10) / 10

  return (
    <div className="space-y-6">
      <GreetingHeader
        name={data.displayName}
        avatarUrl={data.avatarUrl}
        role="teacher"
        subtitle={data.verificationStatus === "approved" ? "Your teaching dashboard — approved & active." : "Complete verification to start accepting bookings."}
        badgeText={data.verificationStatus === "approved" ? "Approved" : "Pending"}
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Earnings" value={`₹${data.totalEarnings.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Sessions Completed" value={data.completedSessions} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Pending Sessions" value={data.pendingSessions} icon={<Clock className="h-5 w-5" />} />
        <StatCard
          label="Avg. Rating"
          value={avgRating}
          icon={<Star className="h-5 w-5" />}
          subtext={data.ratingCount > 0 ? `${data.ratingCount} reviews` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Earnings Trend
            </CardTitle>
            <CardDescription>Your earnings over the last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {data.weeklyEarnings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No earnings data yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weeklyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Earnings"]}
                    />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ fill: "hsl(var(--chart-2))", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Session Performance
            </CardTitle>
            <CardDescription>Completion rate and session breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-6">
            {sessionData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sessions yet.</p>
            ) : (
              <div className="flex items-center gap-8">
                <div className="h-56 w-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sessionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        {sessionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                        formatter={(value, name) => [value, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {sessionData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                      <span className="font-medium ml-auto">{entry.value}</span>
                    </div>
                  ))}
                  {data.completedSessions + data.pendingSessions + data.cancelledSessions > 0 && (
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Completion rate: {Math.round((data.completedSessions / (data.completedSessions + data.pendingSessions + data.cancelledSessions)) * 100)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcomingSessions.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
                <Link href="/teacher/schedule">
                  <span className="text-sm text-primary hover:underline cursor-pointer">Set your availability &rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingSessions.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm transition-colors hover:bg-muted/20">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">with {s.studentName} &middot; {s.durationMinutes}min</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                      {formatTime(s.startsAt)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Subject Distribution
            </CardTitle>
            <CardDescription>Sessions by subject</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {data.subjectDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No session data yet.</p>
            ) : (
              <div className="space-y-4">
                {data.subjectDistribution.map((s, i) => (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.subject}</span>
                      <span className="text-xs text-muted-foreground">{s.count} sessions</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((s.count / Math.max(...data.subjectDistribution.map((x) => x.count))) * 100, 100)}%`, backgroundColor: chartColors[i % chartColors.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Schedule", href: "/teacher/schedule", icon: Calendar },
          { label: "Sessions", href: "/teacher/sessions", icon: BookOpen },
          { label: "Earnings", href: "/teacher/earnings", icon: DollarSign },
          { label: "Profile", href: "/teacher/profile", icon: Users },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground group-hover:text-foreground transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground">Quick action</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
