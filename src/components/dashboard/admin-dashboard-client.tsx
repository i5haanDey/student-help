"use client"

import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import {
  Users,
  BookOpen,
  Clock,
  DollarSign,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  School,
  Activity,
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
import { staggerContainer, fadeUp, listItemVariants } from "@/lib/animations"
import { PatternBg, CornerArc, GlowSpot } from "@/components/ui/pattern-bg"
import { AssemblySequence, AssemblyItem } from "@/components/motion/assembly-sequence"

interface GrowthPoint {
  date: string
  users: number
  teachers: number
}

interface VerificationFunnel {
  name: string
  count: number
  color: string
}

interface SessionVolumePoint {
  date: string
  count: number
}

interface TopTeacher {
  name: string
  sessions: number
  rating: number
}

interface AdminDashboardData {
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  pendingVerifications: number
  totalSessions: number
  disputedSessions: number
  totalRevenue: number
  growthData: GrowthPoint[]
  verificationFunnel: VerificationFunnel[]
  sessionVolume: SessionVolumePoint[]
  topTeachers: TopTeacher[]
}

const topTeacherColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

const adminQuickActions = [
  { label: "Review Teachers", href: "/admin/teachers", desc: "Approve or reject", icon: ShieldCheck },
  { label: "View Sessions", href: "/admin/sessions", desc: "Monitor activity", icon: BookOpen },
  { label: "Disputes", href: "/admin/disputes", desc: "Active disputes", icon: AlertTriangle },
  { label: "Users", href: "/admin/users", desc: "Manage accounts", icon: Users },
]

export function AdminDashboardClient({
  data,
}: {
  data: AdminDashboardData
}) {
  return (
    <AssemblySequence className="space-y-6">
      <AssemblyItem>
        <GreetingHeader
          name="Admin"
          avatarUrl={null}
          role="admin"
          subtitle="Platform overview and management dashboard."
        />
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Users" value={data.totalUsers} icon={<Users className="h-5 w-5" />} index={0} />
          <StatCard label="Teachers" value={data.totalTeachers} icon={<UserCheck className="h-5 w-5" />} index={1} />
          <StatCard label="Students" value={data.totalStudents} icon={<School className="h-5 w-5" />} index={2} />
          <StatCard label="Pending Verif." value={data.pendingVerifications} icon={<Clock className="h-5 w-5" />} index={3} />
          <StatCard label="Total Sessions" value={data.totalSessions} icon={<BookOpen className="h-5 w-5" />} index={4} />
        </div>
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <PatternBg variant="grid" className="opacity-20" />
            <GlowSpot className="-top-20 -right-20 h-40 w-40" color="oklch(0.52 0.24 275)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-1/10 text-chart-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                User Growth
              </CardTitle>
              <CardDescription>Cumulative users and teachers over time</CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative">
              {data.growthData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1/10 to-chart-1/5">
                    <Users className="h-6 w-6 text-chart-1/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Insufficient data to display growth chart.</p>
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.growthData}>
                      <defs>
                        <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="teachersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          fontSize: 13,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        fill="url(#usersGrad)"
                        name="Users"
                      />
                      <Area
                        type="monotone"
                        dataKey="teachers"
                        stroke="hsl(var(--chart-4))"
                        strokeWidth={2}
                        fill="url(#teachersGrad)"
                        name="Teachers"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <PatternBg variant="dots" className="opacity-20" />
            <CornerArc className="top-0 right-0" size={100} />
            <GlowSpot className="-bottom-20 -left-20 h-40 w-40" color="oklch(0.68 0.18 45)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3/20 to-chart-3/10 text-chart-3">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                Teacher Verification
              </CardTitle>
              <CardDescription>Pending, approved, and rejected teachers</CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative">
              {data.verificationFunnel.filter((v) => v.count > 0).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-3/10 to-chart-3/5">
                    <ShieldCheck className="h-6 w-6 text-chart-3/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No teachers registered yet.</p>
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.verificationFunnel} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} strokeOpacity={0.4} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={90} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          fontSize: 13,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                        {data.verificationFunnel.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
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
            <GlowSpot className="-top-20 -right-20 h-40 w-40" color="oklch(0.62 0.2 160)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-chart-2/20 to-chart-2/10 text-chart-2">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                Session Volume
              </CardTitle>
              <CardDescription>Sessions per day (last 14 days)</CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative">
              {data.sessionVolume.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-2/10 to-chart-2/5">
                    <BookOpen className="h-6 w-6 text-chart-2/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No session data yet.</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.sessionVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          fontSize: 13,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24} fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <PatternBg variant="grid" className="opacity-20" />
            <CornerArc className="top-0 right-0" size={100} />
            <GlowSpot className="-bottom-20 -left-20 h-40 w-40" color="oklch(0.72 0.14 310)" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-500">
                  <DollarSign className="h-3.5 w-3.5" />
                </div>
                Top Teachers
              </CardTitle>
              <CardDescription>Teachers with the most completed sessions</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {data.topTeachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                    <Users className="h-6 w-6 text-amber-500/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No teacher data yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topTeachers.map((t, i) => (
                    <motion.div
                      key={t.name}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                      className="flex items-center gap-3 rounded-xl border bg-card/50 p-3 text-sm transition-all duration-200 hover:bg-accent/40 hover:border-primary/10"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: topTeacherColors[i % topTeacherColors.length] }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground/60">
                          {t.sessions} sessions &middot; {t.rating.toFixed(1)} rating
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <div className="h-2 w-16 rounded-full bg-muted/60 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                (t.sessions / Math.max(...data.topTeachers.map((x) => x.sessions))) * 100,
                                100
                              )}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                            style={{
                              backgroundColor:
                                topTeacherColors[i % topTeacherColors.length],
                            }}
                          />
                        </div>
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
          {adminQuickActions.map((item, i) => (
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
