"use client"

import { motion } from "framer-motion"
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"
import {
  Sparkles,
  Users,
  Brain,
  Zap,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Trophy,
  TrendingUp,
  Lightbulb,
  Target,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/dashboard/stat-card"
import { GreetingHeader } from "@/components/dashboard/greeting-header"
import { QuoteOfTheDay } from "@/components/dashboard/quote-of-the-day"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  staggerContainer,
  fadeUp,
  listItemVariants,
  ease,
  easeOut,
} from "@/lib/animations"
import { PatternBg, CornerArc, GlowSpot } from "@/components/ui/pattern-bg"
import { ScrollReveal, RevealItem } from "@/components/motion/scroll-reveal"
import { AssemblySequence, AssemblyItem } from "@/components/motion/assembly-sequence"
import { AnimatedCounter } from "@/components/motion/animated-counter"

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

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15",
  in_progress: "bg-primary/10 text-primary border-primary/15",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15",
  high: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15",
  low: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/15",
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const style = statusStyles[s] || "bg-muted/50 text-muted-foreground border-border"
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
      {status}
    </span>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    doubt: <HelpCircle className="h-4 w-4" />,
    session: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    practice: <Zap className="h-4 w-4" />,
  }
  return icons[type] || <BookOpen className="h-4 w-4" />
}

const quickActions = [
  { label: "Ask AI", href: "/student/ask", icon: Sparkles, desc: "Solve doubts instantly" },
  { label: "Find Teacher", href: "/student/teachers", icon: Users, desc: "Book live sessions" },
  { label: "Practice", href: "/student/practice", icon: Zap, desc: "Test your knowledge" },
  { label: "My Sessions", href: "/student/sessions", icon: BookOpen, desc: "View history" },
]

export function StudentDashboardClient({
  data,
}: {
  data: StudentDashboardData
}) {
  const avgScore = Math.round(data.avgMasteryScore)
  const topSubjects = data.subjectScores.slice(0, 4)

  return (
    <AssemblySequence className="space-y-6">
      <AssemblyItem>
        <GreetingHeader
          name={data.displayName}
          avatarUrl={data.avatarUrl}
          role="student"
          subtitle="Here&apos;s your learning overview for today."
        />
      </AssemblyItem>

      <AssemblyItem>
        <QuoteOfTheDay />
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Sessions Completed"
            value={data.sessionsCompleted}
            icon={<Users className="h-5 w-5" />}
            index={0}
          />
          <StatCard
            label="Doubts Solved"
            value={data.doubtsSolved}
            icon={<Sparkles className="h-5 w-5" />}
            index={1}
          />
          <StatCard
            label="Mastery Score"
            value={`${avgScore}%`}
            icon={<Brain className="h-5 w-5" />}
            index={2}
          />
          <StatCard
            label="Practice Sets"
            value={data.practiceSetsCompleted}
            icon={<Zap className="h-5 w-5" />}
            index={3}
          />
        </div>
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <PatternBg variant="dots" className="opacity-25" />
            <GlowSpot
              className="-top-20 -right-20 h-40 w-40"
              color="oklch(0.52 0.24 275)"
            />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  <Trophy className="h-3.5 w-3.5" />
                </div>
                Overall Progress
              </CardTitle>
              <CardDescription>
                Your mastery score across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6 relative">
              <div className="h-52 w-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    barSize={22}
                    data={[
                      {
                        name: "Mastery",
                        value: avgScore,
                        fill: "hsl(var(--chart-1))",
                      },
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      tick={false}
                    />
                    <RadialBar background dataKey="value" cornerRadius={12} />
                    <text
                      x="50%"
                      y="48%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-4xl font-bold fill-foreground"
                    >
                      {avgScore}%
                    </text>
                    <text
                      x="50%"
                      y="62%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-muted-foreground"
                    >
                      overall
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <PatternBg variant="crosshatch" className="opacity-20" />
            <CornerArc className="top-0 right-0" size={100} />
            <GlowSpot
              className="-bottom-20 -left-20 h-40 w-40"
              color="oklch(0.62 0.2 160)"
            />
            <CardHeader className="pb-2 relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-chart-2/20 to-chart-2/10 text-chart-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                Subject Progress
              </CardTitle>
              <CardDescription>
                Your top subjects by mastery score
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative">
              {topSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <Brain className="h-6 w-6 text-primary/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No subject data yet.
                  </p>
                  <Link
                    href="/student/practice"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Complete a practice set{" "}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {topSubjects.map((s, i) => (
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
                        <span className="text-xs text-muted-foreground font-mono">
                          {s.score}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              chartColors[i % chartColors.length],
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.score}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.3 + i * 0.1,
                            ease,
                          }}
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
                <PatternBg
                  variant={i % 2 === 0 ? "dots" : "crosshatch"}
                  className="opacity-25"
                />
                <CornerArc className="top-0 right-0" size={60} />
                <div className="flex items-center gap-3 relative">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/18 group-hover:to-primary/8">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground/60 truncate">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </AssemblyItem>

      <AssemblyItem>
        <Card className="overflow-hidden">
          <PatternBg variant="grid" className="opacity-20" />
          <GlowSpot
            className="-bottom-20 -right-20 h-40 w-40"
            color="oklch(0.68 0.18 45)"
          />
          <CardHeader className="pb-3 relative">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-500">
                <Clock className="h-3.5 w-3.5" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest doubts, sessions, and practice
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {data.recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Lightbulb className="h-6 w-6 text-primary/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start by asking your first doubt!
                </p>
                <Link
                  href="/student/ask"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Ask a question{" "}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.recentActivity.map((a, i) => (
                  <motion.div
                    key={a.id}
                    custom={i}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 2, transition: { duration: 0.15 } }}
                    className="group flex items-center gap-3 rounded-xl border bg-card/50 p-3 text-sm transition-all duration-200 hover:bg-accent/40 hover:border-primary/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-muted-foreground group-hover:text-primary transition-colors duration-200">
                      <ActivityIcon type={a.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground/60 truncate">
                        {a.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={a.status} />
                      <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap font-mono">
                        {a.timeAgo}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AssemblyItem>
    </AssemblySequence>
  )
}
