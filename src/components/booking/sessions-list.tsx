"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, IndianRupee, Video, ArrowRight, Play, History, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive"; label: string }> = {
  pending: { variant: "warning", label: "Pending" },
  confirmed: { variant: "success", label: "Confirmed" },
  in_progress: { variant: "default", label: "In Progress" },
  completed: { variant: "secondary", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  disputed: { variant: "destructive", label: "Disputed" },
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
      } catch (console) {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <div className="text-center py-20">
        <Video className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="text-muted-foreground mt-4">No sessions found.</p>
        {role === "student" && (
          <Button className="mt-4" onClick={() => router.push("/student/teachers")}>
            Find a Teacher
          </Button>
        )}
      </div>
    )
  }

  const other = role === "student" ? "teacher" : "student"

  function renderSession(session: Session, showActions: boolean) {
    const config = statusConfig[session.status] ?? { variant: "outline", label: session.status }
    const person = session[other]
    const startDate = session.startsAt ? new Date(session.startsAt) : null

    const canJoin = (session.status === "confirmed" || session.status === "in_progress") && showActions
    const canView = session.status === "completed"

    return (
      <Card
        key={session.id}
        className={canView ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
        onClick={() => {
          if (canView) {
            router.push(`/${role}/sessions/${session.id}/details`)
          }
        }}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={person?.avatarUrl ?? ""} />
                <AvatarFallback>{person?.displayName?.charAt(0) ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{person?.displayName}</p>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{session.subject}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {startDate
                      ? startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Instant"}
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
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-xs">
                {session.sessionType}
              </Badge>
              {canJoin && (
                <Button size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/${role}/sessions/${session.id}`) }}>
                  <Play className="h-3 w-3 mr-1" /> Join
                </Button>
              )}
              {canView && (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/${role}/sessions/${session.id}/details`) }}>
                  <ArrowRight className="h-3 w-3 mr-1" /> Details
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
            Upcoming & Ongoing
            {upcoming.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5">{upcoming.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Session History
            {past.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5">{past.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-12">
              <Play className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-2">No upcoming sessions.</p>
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

        <TabsContent value="past" className="space-y-4 mt-4">
          {past.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-2">No session history yet.</p>
            </div>
          ) : (
            past.map((s) => renderSession(s, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
