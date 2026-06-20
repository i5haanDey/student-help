"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, IndianRupee, Video, ArrowRight, Play, History, Sparkles, Zap, Shield, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

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

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive"; label: string; icon: typeof Zap }> = {
  pending: { variant: "warning", label: "Pending", icon: Clock },
  confirmed: { variant: "success", label: "Confirmed", icon: Shield },
  in_progress: { variant: "default", label: "Live Now", icon: Zap },
  completed: { variant: "secondary", label: "Completed", icon: Sparkles },
  cancelled: { variant: "destructive", label: "Cancelled", icon: AlertCircle },
  disputed: { variant: "destructive", label: "Disputed", icon: AlertCircle },
}

const subjectGradients: Record<string, string> = {
  Mathematics: "from-blue-600 to-indigo-600",
  Physics: "from-purple-600 to-pink-600",
  Chemistry: "from-emerald-600 to-teal-600",
  Biology: "from-green-600 to-emerald-600",
  "Computer Science": "from-cyan-600 to-blue-600",
  English: "from-rose-600 to-pink-600",
  History: "from-amber-600 to-orange-600",
  Geography: "from-teal-600 to-cyan-600",
  Economics: "from-violet-600 to-purple-600",
}

function getSubjectGradient(subject: string): string {
  for (const [key, grad] of Object.entries(subjectGradients)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) return grad
  }
  return "from-primary to-primary/60"
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
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading your sessions...</p>
      </div>
    )
  }

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/10">
          <Video className="h-8 w-8 text-primary/60" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          {role === "student"
            ? "Find a teacher and book your first session to get started."
            : "You haven't had any sessions yet. They'll appear here once students book with you."}
        </p>
        {role === "student" && (
          <Button onClick={() => router.push("/student/teachers")} className="shadow-lg shadow-primary/20">
            <BookOpen className="h-4 w-4 mr-2" /> Find a Teacher
          </Button>
        )}
      </motion.div>
    )
  }

  const other = role === "student" ? "teacher" : "student"

  function renderSession(session: Session, showActions: boolean, index: number) {
    const config = statusConfig[session.status] ?? { variant: "outline" as const, label: session.status, icon: AlertCircle }
    const person = session[other]
    const startDate = session.startsAt ? new Date(session.startsAt) : null
    const canJoin = (session.status === "confirmed" || session.status === "in_progress") && showActions
    const canView = session.status === "completed"
    const StatusIcon = config.icon
    const isLive = session.status === "in_progress"
    const grad = getSubjectGradient(session.subject)
    const initials = getInitials(person?.displayName ?? "?")

    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card
          className={`group relative overflow-hidden transition-all duration-300 ${
            canView ? "cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5" : ""
          } ${isLive ? "ring-2 ring-primary/30 shadow-lg shadow-primary/10" : "hover:shadow-md"}`}
          onClick={() => {
            if (canView) router.push(`/${role}/sessions/${session.id}/details`)
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${grad} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />

          {isLive && (
            <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            </div>
          )}

          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <Avatar className={`h-12 w-12 ring-2 ring-background ${isLive ? "ring-primary/30" : "ring-border"}`}>
                    <AvatarImage src={person?.avatarUrl ?? ""} />
                    <AvatarFallback className={`bg-gradient-to-br ${grad} text-white text-sm font-bold`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isLive && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background">
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{person?.displayName}</p>
                    <Badge
                      variant={config.variant}
                      className={`text-[10px] px-2 py-0 gap-1 ${isLive ? "animate-pulse" : ""}`}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {config.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/30">
                      {session.sessionType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r ${grad} text-white`}>
                      <BookOpen className="h-3 w-3" />
                      {session.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                      <Clock className="h-3 w-3" />
                      {session.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                      <Calendar className="h-3 w-3" />
                      {startDate
                        ? startDate.toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : "Flexible"}
                    </span>
                    {session.amountInr && (
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                        <IndianRupee className="h-3 w-3" />
                        {session.amountInr.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canJoin && (
                  <Button
                    size="sm"
                    className={`shadow-lg ${isLive ? "shadow-primary/30 animate-pulse" : "shadow-primary/10"}`}
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
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="p-1 bg-muted/60 backdrop-blur-sm">
          <TabsTrigger value="upcoming" className="flex items-center gap-2 data-[state=active]:shadow-sm">
            <Play className="h-4 w-4" />
            Upcoming
            {upcoming.length > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2 data-[state=active]:shadow-sm">
            <History className="h-4 w-4" />
            History
            {past.length > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground font-medium">
                {past.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent key={tab} value="upcoming" className="space-y-3 mt-4">
            {upcoming.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-primary/40" />
                </div>
                <p className="text-muted-foreground">All caught up! No upcoming sessions.</p>
                {role === "student" && (
                  <Button className="mt-4" size="sm" onClick={() => router.push("/student/teachers")}>
                    Book a Session
                  </Button>
                )}
              </motion.div>
            ) : (
              upcoming.map((s, i) => renderSession(s, true, i))
            )}
          </TabsContent>

          <TabsContent key={`past-${tab}`} value="past" className="space-y-3 mt-4">
            {past.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground">No session history yet.</p>
              </motion.div>
            ) : (
              past.map((s, i) => renderSession(s, false, i))
            )}
          </TabsContent>
        </AnimatePresence>
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
