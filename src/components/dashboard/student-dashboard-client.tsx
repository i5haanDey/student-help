"use client"

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts"
import { Sparkles, Users, Brain, Zap, BookOpen, HelpCircle, ArrowRight, Trophy } from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { GreetingHeader } from "@/components/dashboard/greeting-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SubjectScore {
  subject: string
  score: number
}

interface RecentActivity {
  id: string
  type: "doubt" | "session" | "practice"
  title: string
  subtitle: string
  status: string
  timeAgo: string
}

interface StudentDashboardData {
  displayName: string
  avatarUrl: string | null
  sessionsCompleted: number
  doubtsSolved: number
  avgMasteryScore: number
  practiceSetsCompleted: number
  subjectScores: SubjectScore[]
  recentActivity: RecentActivity[]
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

const statusColors: Record<string, string> = {
  completed: "text-[hsl(var(--chart-2))]",
  in_progress: "text-[hsl(var(--chart-1))]",
  pending: "text-[hsl(var(--chart-3))]",
  high: "text-[hsl(var(--chart-2))]",
  medium: "text-[hsl(var(--chart-3))]",
  low: "text-[hsl(var(--chart-5))]",
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase()
  const color = statusColors[s] || "text-muted-foreground"
  return <Badge variant="outline" className={`${color} text-[10px] px-1.5 py-0`}>{status}</Badge>
}

export function StudentDashboardClient({ data }: { data: StudentDashboardData }) {
  const avgScore = Math.round(data.avgMasteryScore)
  const topSubjects = data.subjectScores.slice(0, 4)

  const activityIcon = (type: string) => {
    switch (type) {
      case "doubt": return <HelpCircle className="h-4 w-4" />
      case "session": return <VideoIcon className="h-4 w-4" />
      case "practice": return <Zap className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <GreetingHeader
        name={data.displayName}
        avatarUrl={data.avatarUrl}
        role="student"
        subtitle="Here's your learning overview for today."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sessions Completed" value={data.sessionsCompleted} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Doubts Solved" value={data.doubtsSolved} icon={<Sparkles className="h-5 w-5" />} />
        <StatCard label="Mastery Score" value={`${avgScore}%`} icon={<Brain className="h-5 w-5" />} />
        <StatCard label="Practice Sets" value={data.practiceSetsCompleted} icon={<Zap className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              Overall Progress
            </CardTitle>
            <CardDescription>Your mastery score across all subjects</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <div className="h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="55%" outerRadius="85%"
                  barSize={22}
                  data={[{ name: "Mastery", value: avgScore, fill: "hsl(var(--chart-1))" }]}
                  startAngle={90} endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={12} />
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-foreground">
                    {avgScore}%
                  </text>
                  <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-muted-foreground">
                    overall
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              Subject Progress
            </CardTitle>
            <CardDescription>Your top subjects by mastery score</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {topSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No subject data yet. Complete a practice set to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {topSubjects.map((s, i) => (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.subject}</span>
                      <span className="text-xs text-muted-foreground">{s.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.score}%`, backgroundColor: chartColors[i % chartColors.length] }}
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
          { label: "Ask AI", href: "/student/ask", icon: Sparkles },
          { label: "Find Teacher", href: "/student/teachers", icon: Users },
          { label: "Practice", href: "/student/practice", icon: Zap },
          { label: "My Sessions", href: "/student/sessions", icon: BookOpen },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground">Quick action</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest doubts, sessions, and practice</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">No activity yet. Start by asking your first doubt!</p>
              <Link href="/student/ask">
                <span className="text-sm text-primary hover:underline cursor-pointer">Ask a question &rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {activityIcon(a.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(a.status)}
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}
