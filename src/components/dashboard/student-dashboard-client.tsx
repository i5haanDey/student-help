"use client"

import { motion } from "framer-motion"
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

const stagger = {
  animate: {
    transition: { staggerChildren: 0.07 },
  },
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

const statusColors: Record<string, string> = {
  completed: "bg-[hsl(var(--chart-2)_/_0.15)] text-[hsl(var(--chart-2))]",
  in_progress: "bg-[hsl(var(--chart-1)_/_0.15)] text-[hsl(var(--chart-1))]",
  pending: "bg-[hsl(var(--chart-3)_/_0.15)] text-[hsl(var(--chart-3))]",
  high: "bg-[hsl(var(--chart-2)_/_0.15)] text-[hsl(var(--chart-2))]",
  medium: "bg-[hsl(var(--chart-3)_/_0.15)] text-[hsl(var(--chart-3))]",
  low: "bg-[hsl(var(--chart-5)_/_0.15)] text-[hsl(var(--chart-5))]",
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase()
  const color = statusColors[s] || "bg-muted text-muted-foreground"
  return <Badge variant="secondary" className={`${color} border-0 text-[10px] px-2 py-0.5`}>{status}</Badge>
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
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      <GreetingHeader
        name={data.displayName}
        avatarUrl={data.avatarUrl}
        role="student"
        subtitle="Here's your learning overview for today."
      />

      <motion.div
        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Sessions Completed"
          value={data.sessionsCompleted}
          icon={<Users className="h-5 w-5" />}
          color="chart-1"
        />
        <StatCard
          title="Doubts Solved"
          value={data.doubtsSolved}
          icon={<Sparkles className="h-5 w-5" />}
          color="chart-2"
        />
        <StatCard
          title="Mastery Score"
          value={avgScore}
          icon={<Brain className="h-5 w-5" />}
          color="chart-4"
          format="percent"
        />
        <StatCard
          title="Practice Sets"
          value={data.practiceSetsCompleted}
          icon={<Zap className="h-5 w-5" />}
          color="chart-3"
        />
      </motion.div>

      <motion.div
        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[hsl(var(--chart-3))]" />
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

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-[hsl(var(--chart-4))]" />
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
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: chartColors[i % chartColors.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
        className="grid gap-4 grid-cols-2 md:grid-cols-4"
      >
        {[
          { label: "Ask AI", href: "/student/ask", icon: Sparkles, color: "chart-1" },
          { label: "Find Teacher", href: "/student/teachers", icon: Users, color: "chart-2" },
          { label: "Practice", href: "/student/practice", icon: Zap, color: "chart-3" },
          { label: "My Sessions", href: "/student/sessions", icon: BookOpen, color: "chart-4" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md cursor-pointer"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--${item.color})_/_0.12)] text-[hsl(var(--${item.color}))]`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground">Quick action</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </motion.div>
          </Link>
        ))}
      </motion.div>

      <motion.div
        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
      >
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[hsl(var(--chart-1))]" />
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
                  <span className="text-sm text-primary hover:underline cursor-pointer">Ask a question →</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 text-sm">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--chart-1)_/_0.1)] text-[hsl(var(--chart-1))]`}>
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
      </motion.div>
    </motion.div>
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
