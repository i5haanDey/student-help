"use client"

import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  DollarSign,
  BookOpen,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Calendar,
  BarChart3,
  Award,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { GreetingHeader } from "@/components/dashboard/greeting-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { staggerContainer, fadeUp, listItemVariants, ease } from "@/lib/animations"
import { PatternBg, CornerArc, GlowSpot } from "@/components/ui/pattern-bg"
import { AssemblySequence, AssemblyItem } from "@/components/motion/assembly-sequence"

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

const quickActions = [
  { label: "Schedule", href: "/teacher/schedule", icon: Calendar, desc: "Manage availability" },
  { label: "Sessions", href: "/teacher/sessions", icon: BookOpen, desc: "View history" },
  { label: "Earnings", href: "/teacher/earnings", icon: DollarSign, desc: "Track payouts" },
  { label: "Profile", href: "/teacher/profile", icon: Users, desc: "Edit your profile" },
]

export function TeacherDashboardClient({
  data,
}: {
  data: TeacherDashboardData
}) {
  const sessionData = [
    { name: "Completed", value: data.completedSessions, color: "hsl(var(--chart-2))" },
    { name: "Pending", value: data.pendingSessions, color: "hsl(var(--chart-3))" },
    { name: "Cancelled", value: data.cancelledSessions, color: "hsl(var(--chart-5))" },
  ].filter((d) => d.value > 0)

  const avgRating = Math.round(data.avgRating * 10) / 10

  return (
    <AssemblySequence className="space-y-6">
      <AssemblyItem>
        <GreetingHeader
          name={data.displayName}
          avatarUrl={data.avatarUrl}
          role="teacher"
          subtitle={
            data.verificationStatus === "approved"
              ? "Your teaching dashboard — approved & active."
              : "Complete verification to start accepting bookings."
          }
          badgeText={data.verificationStatus === "approved" ? "Approved" : "Pending"}
        />
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Earnings"
            value={`₹${data.totalEarnings.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            index={0}
          />
          <StatCard
            label="Sessions Completed"
            value={data.completedSessions}
            icon={<BookOpen className="h-5 w-5" />}
            index={1}
          />
          <StatCard
            label="Total Students"
            value={data.totalStudents}
            icon={<Users className="h-5 w-5" />}
            index={2}
          />
          <StatCard
            label="Avg. Rating"
            value={avgRating}
            icon={<Star className="h-5 w-5" />}
            subtext={data.ratingCount > 0 ? `${data.ratingCount} reviews` : undefined}
            index={3}
          />
        </div>
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <PatternBg variant="grid" className="opacity-20" />
            <GlowSpot className="-top-20 -right-20 h-40 w-40" color="oklch(0.62 0.2 160)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-chart-2/20 to-chart-2/10 text-chart-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                Earnings Trend
              </CardTitle>
              <CardDescription>Your earnings over the last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative">
              {data.weeklyEarnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-2/10 to-chart-2/5">
                    <DollarSign className="h-6 w-6 text-chart-2/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No earnings data yet.</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.weeklyEarnings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          fontSize: 13,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Earnings"]}
                      />
                      <defs>
                        <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2.5}
                        dot={{ fill: "hsl(var(--chart-2))", r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <PatternBg variant="dots" className="opacity-20" />
            <CornerArc className="top-0 right-0" size={100} />
            <GlowSpot className="-bottom-20 -left-20 h-40 w-40" color="oklch(0.72 0.14 310)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-chart-4/20 to-chart-4/10 text-chart-4">
                  <BarChart3 className="h-3.5 w-3.5" />
                </div>
                Session Performance
              </CardTitle>
              <CardDescription>Completion rate and session breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pb-6 relative">
              {sessionData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-4/10 to-chart-4/5">
                    <BookOpen className="h-6 w-6 text-chart-4/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No sessions yet.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="h-56 w-56 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sessionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {sessionData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            fontSize: 13,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          }}
                          formatter={(value, name) => [value, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 w-full max-w-[160px]">
                    {sessionData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground flex-1">{entry.name}</span>
                        <span className="font-semibold">{entry.value}</span>
                      </div>
                    ))}
                    {data.completedSessions + data.pendingSessions + data.cancelledSessions > 0 && (
                      <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        Completion rate:{" "}
                        <span className="font-semibold text-foreground">
                          {Math.round(
                            (data.completedSessions /
                              (data.completedSessions +
                                data.pendingSessions +
                                data.cancelledSessions)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <PatternBg variant="crosshatch" className="opacity-20" />
            <GlowSpot className="-top-20 -right-20 h-40 w-40" color="oklch(0.68 0.18 45)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-500">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                Upcoming Sessions
              </CardTitle>
              <CardDescription>Your next scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {data.upcomingSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                    <Calendar className="h-6 w-6 text-amber-500/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
                  <Link
                    href="/teacher/schedule"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Set your availability <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.upcomingSessions.slice(0, 5).map((s, i) => (
                    <motion.div
                      key={s.id}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                      className="flex items-center gap-3 rounded-xl border bg-card/50 p-3 text-sm transition-all duration-200 hover:bg-accent/40 hover:border-primary/10"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-muted-foreground">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.subject}</p>
                        <p className="text-xs text-muted-foreground/60 truncate">
                          with {s.studentName} &middot; {s.durationMinutes}min
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] whitespace-nowrap border-primary/15 bg-primary/5 text-primary"
                      >
                        {formatTime(s.startsAt)}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <PatternBg variant="grid" className="opacity-20" />
            <CornerArc className="top-0 right-0" size={100} />
            <GlowSpot className="-bottom-20 -left-20 h-40 w-40" color="oklch(0.68 0.18 45)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3/20 to-chart-3/10 text-chart-3">
                  <Award className="h-3.5 w-3.5" />
                </div>
                Subject Distribution
              </CardTitle>
              <CardDescription>Sessions by subject</CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative">
              {data.subjectDistribution.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-3/10 to-chart-3/5">
                    <BookOpen className="h-6 w-6 text-chart-3/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No session data yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {data.subjectDistribution.map((s, i) => (
                    <motion.div
                      key={s.subject}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-1.5"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{s.subject}</span>
                        <span className="text-xs text-muted-foreground font-mono">{s.count} sessions</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: chartColors[i % chartColors.length] }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (s.count / Math.max(...data.subjectDistribution.map((x) => x.count))) * 100,
                              100
                            )}%`,
                          }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.1, ease }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {quickActions.map((item, i) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                custom={i}
                variants={listItemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-card transition-shadow duration-300 hover:shadow-elevated cursor-pointer"
              >
                <PatternBg variant={i % 2 === 0 ? "dots" : "crosshatch"} className="opacity-25" />
                <CornerArc className="top-0 right-0" size={60} />
                <div className="flex items-center gap-3 relative">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/18 group-hover:to-primary/8">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground/60 truncate">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </AssemblyItem>
    </AssemblySequence>
  )
}
