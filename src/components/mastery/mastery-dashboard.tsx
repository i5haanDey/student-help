"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Brain, BookOpen, Target, TrendingUp } from "lucide-react"
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts"
import { staggerContainer, fadeUp, listItemVariants } from "@/lib/animations"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"
import { AssemblySequence, AssemblyItem } from "@/components/motion/assembly-sequence"

interface SubjectScore {
  subject: string
  score: number
  sessionCount: number
  practiceCount: number
  lastUpdated: string
}

interface MasteryData {
  overall: number
  subjects: SubjectScore[]
  stats: {
    sessionsCompleted: number
    doubtsSolved: number
    totalSubjects: number
  }
}

export function MasteryDashboard() {
  const [data, setData] = useState<MasteryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/mastery")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your mastery data...</p>
        </div>
      </div>
    )
  }

  const overall = Number(data?.overall ?? 0)

  return (
    <AssemblySequence className="space-y-8">
      <AssemblyItem>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          Mastery Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-12">Track your learning progress across subjects.</p>
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Overall Mastery", value: `${overall}%`, icon: Brain },
            { title: "Subjects", value: data?.stats.totalSubjects ?? 0, icon: BookOpen },
            { title: "Sessions", value: data?.stats.sessionsCompleted ?? 0, icon: Target },
            { title: "Doubts Solved", value: data?.stats.doubtsSolved ?? 0, icon: TrendingUp },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="overflow-hidden">
                <PatternBg variant={i % 2 === 0 ? "dots" : "crosshatch"} className="opacity-30" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold tracking-tight">{item.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AssemblyItem>

      <AssemblyItem>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden">
            <PatternBg variant="grid" className="opacity-25" />
            <CardHeader className="relative">
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Your mastery score across all subjects.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center relative">
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={20}
                    data={[{ name: "Mastery", value: overall, fill: "hsl(var(--primary))" }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={10} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-foreground">
                      {overall}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <PatternBg variant="dots" className="opacity-25" />
            <CornerArc className="top-0 right-0" size={100} />
            <CardHeader className="relative">
              <CardTitle>Subject Breakdown</CardTitle>
              <CardDescription>Your mastery score per subject.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 relative">
              {(!data?.subjects || data.subjects.length === 0) ? (
                <div className="text-center py-10 space-y-2">
                  <Brain className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No mastery data yet. Complete a practice set to get started.</p>
                </div>
              ) : (
                data.subjects.map((s, i) => (
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
                      <span className="text-muted-foreground font-mono">{s.score}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted/70 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      {s.sessionCount} sessions &middot; {s.practiceCount} practice sets
                    </p>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </AssemblyItem>
    </AssemblySequence>
  )
}
