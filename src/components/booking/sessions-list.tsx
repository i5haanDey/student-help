"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, IndianRupee, Video, ArrowRight, Play, History, Sparkles, Shield, AlertCircle, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"

interface Session {
  id: string
  subject: string
  sessionType: "instant" | "scheduled"
  durationMinutes: number
  status: string
  amountInr: number | null
  startsAt: string | null
  roomUrl: string | null
  createdAt: string
  student: { id: string; displayName: string; avatarUrl: string | null }
  teacher: { id: string; displayName: string; avatarUrl: string | null }
}

const subjectAccent: Record<string, string> = {
  mathematics: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  physics: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  chemistry: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  biology: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "computer science": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  english: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  history: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  geography: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  economics: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
}

function getSubjectAccent(subject: string): string {
  for (const [key, cls] of Object.entries(subjectAccent)) {
    if (subject.toLowerCase().includes(key)) return cls
  }
  return "bg-muted text-muted-foreground"
}

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive"; label: string; icon: LucideIcon }> = {
  pending: { variant: "warning", label: "Pending", icon: Clock },
  confirmed: { variant: "success", label: "Confirmed", icon: Shield },
  in_progress: { variant: "default", label: "Live Now", icon: Zap },
  completed: { variant: "secondary", label: "Completed", icon: Sparkles },
  cancelled: { variant: "destructive", label: "Cancelled", icon: AlertCircle },
  disputed: { variant: "destructive", label: "Disputed", icon: AlertCircle },
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function SessionsList({ role }: { role: "student" | "teacher" }) {
  const router = useRouter()
  const [upcoming, setUpcoming] = useState<Session[]>([])
  const [past, setPast] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState("upcoming")

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          fetch(`/api/bookings?role=${role}&scope=upcoming`),
          fetch(`/api/bookings?role=${role}&scope=past`),
        ])
        const upcomingData = await upcomingRes.json()
        const pastData = await pastRes.json()
        setUpcoming(Array.isArray(upcomingData) ? upcomingData : [])
        setPast(Array.isArray(pastData) ? pastData : [])
      } catch {
        setUpcoming([])
        setPast([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [role])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your sessions...</p>
      </div>
    )
  }

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <div className="relative overflow-hidden text-center py-20 rounded-xl border bg-card/50">
        <PatternBg variant="crosshatch" className="opacity-30" />
        <div className="relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <Video className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
            {role === "student"
              ? "Find a teacher and book your first session to get started."
              : "You haven't had any sessions yet. They'll appear here once students book with you."}
          </p>
          {role === "student" && (
            <Button onClick={() => router.push("/student/teachers")}>
              <BookOpen className="h-4 w-4 mr-2" /> Find a Teacher
            </Button>
          )}
        </div>
      </div>
    )
  }

  const other = role === "student" ? "teacher" : "student"

  function renderSession(session: Session, showActions: boolean) {
    const config = statusConfig[session.status] ?? { variant: "outline" as const, label: session.status, icon: AlertCircle }
    const person = session[other]
    const startDate = session.startsAt ? new Date(session.startsAt) : null
    const canJoin = (session.status === "confirmed" || session.status === "in_progress") && showActions
    const canView = session.status === "completed"
    const StatusIcon = config.icon
    const isLive = session.status === "in_progress"
    const initials = getInitials(person?.displayName ?? "?")
    const accent = getSubjectAccent(session.subject)

    return (
      <Card
        key={session.id}
        className={`group transition-all duration-200 ${
          canView ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
        } ${isLive ? "shadow-md" : "shadow-sm hover:shadow-md"}`}
        onClick={() => {
          if (canView) router.push(`/${role}/sessions/${session.id}/details`)
        }}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 ring-1 ring-border">
                  <AvatarImage src={person?.avatarUrl ?? ""} />
                  <AvatarFallback className="bg-muted text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isLive && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{person?.displayName}</p>
                  <Badge variant={config.variant} className="text-[10px] px-2 py-0 gap-1">
                    <StatusIcon className="h-2.5 w-2.5" />
                    {config.label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {session.sessionType}
                  </Badge>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${accent}`}>
                  <BookOpen className="h-3 w-3" />
                  {session.subject}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {startDate
                      ? startDate.toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "Flexible"}
                  </span>
                  {session.amountInr && (
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {session.amountInr.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-1">
              {canJoin && (
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); router.push(`/${role}/sessions/${session.id}`) }}
                >
                  <Play className="h-3 w-3 mr-1 fill-current" /> {isLive ? "Join Live" : "Join"}
                </Button>
              )}
              {canView && (
                <Button
                  size="sm"
                  variant="outline"
                  className="group/btn"
                  onClick={(e) => { e.stopPropagation(); router.push(`/${role}/sessions/${session.id}/details`) }}
                >
                  Details <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Upcoming
            {upcoming.length > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
            {past.length > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground font-medium">
                {past.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground">All caught up! No upcoming sessions.</p>
              {role === "student" && (
                <Button className="mt-4" size="sm" onClick={() => router.push("/student/teachers")}>
                  Book a Session
                </Button>
              )}
            </div>
          ) : (
            upcoming.map((s) => renderSession(s, true))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3 mt-4">
          {past.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                <History className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground">No session history yet.</p>
            </div>
          ) : (
            past.map((s) => renderSession(s, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
