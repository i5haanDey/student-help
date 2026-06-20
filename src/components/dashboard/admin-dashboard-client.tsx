"use client"

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts"
import { Users, BookOpen, Clock, DollarSign, ShieldCheck, UserCheck, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { GreetingHeader } from "@/components/dashboard/greeting-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

export function AdminDashboardClient({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-6">
      <GreetingHeader
        name="Admin"
        avatarUrl={null}
        role="admin"
        subtitle="Platform overview and management dashboard."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Users" value={data.totalUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Teachers" value={data.totalTeachers} icon={<UserCheck className="h-5 w-5" />} />
        <StatCard label="Students" value={data.totalStudents} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pending Verif." value={data.pendingVerifications} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Total Sessions" value={data.totalSessions} icon={<BookOpen className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              User Growth
            </CardTitle>
            <CardDescription>Cumulative users and teachers over time</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {data.growthData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Insufficient data to display growth chart.</p>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                    />
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#usersGrad)" name="Users" />
                    <Area type="monotone" dataKey="teachers" stroke="hsl(var(--chart-4))" strokeWidth={2} fill="url(#teachersGrad)" name="Teachers" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Teacher Verification Funnel
            </CardTitle>
            <CardDescription>Pending, approved, and rejected teachers</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {data.verificationFunnel.filter((v) => v.count > 0).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No teachers registered yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.verificationFunnel} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={90} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Session Volume
            </CardTitle>
            <CardDescription>Sessions per day (last 14 days)</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {data.sessionVolume.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No session data yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sessionVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24} fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Top Teachers
            </CardTitle>
            <CardDescription>Teachers with the most completed sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topTeachers.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Users className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No teacher data yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.topTeachers.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm transition-colors hover:bg-muted/20">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))` }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.sessions} sessions &middot; {t.rating.toFixed(1)} rating</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((t.sessions / Math.max(...data.topTeachers.map((x) => x.sessions))) * 100, 100)}%`, backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Review Teachers", href: "/admin/teachers", desc: "Approve or reject", icon: ShieldCheck },
          { label: "View Sessions", href: "/admin/sessions", desc: "Monitor activity", icon: BookOpen },
          { label: "Disputes", href: "/admin/disputes", desc: `Active: ${data.disputedSessions}`, icon: AlertTriangle },
          { label: "Users", href: "/admin/users", desc: "Manage accounts", icon: Users },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
