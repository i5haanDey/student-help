"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Calendar, Clock, Star, MessageSquare, Sparkles, BookOpen, IndianRupee } from "lucide-react"
import type { SessionDetails } from "@/types"

interface SessionDetailsViewProps {
  bookingId: string
  role: "student" | "teacher"
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "warning" }> = {
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  disputed: { label: "Disputed", variant: "destructive" },
  confirmed: { label: "Confirmed", variant: "warning" },
  in_progress: { label: "In Progress", variant: "default" },
}

export function SessionDetailsView({ bookingId, role }: SessionDetailsViewProps) {
  const router = useRouter()
  const [data, setData] = useState<SessionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const liveSessionRes = await fetch(`/api/bookings/${bookingId}?include=liveSession`)
        const bookingData = await liveSessionRes.json()
        if (!bookingData?.liveSession?.id) {
          setData(null)
          return
        }
        const res = await fetch(`/api/sessions/${bookingData.liveSession.id}/details`)
        const details = await res.json()
        if (res.ok) setData(details)
      } catch {
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [bookingId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Session details not found.</p>
        <Button onClick={() => router.push(`/${role}/sessions`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sessions
        </Button>
      </div>
    )
  }

  const { booking, liveSession, chatMessages, practiceSet, rating, totalActualDuration } = data
  const person = role === "student" ? booking.teacher : booking.student
  const startDate = booking.startsAt ? new Date(booking.startsAt) : null
  const statusConfig = statusLabels[booking.status] ?? { label: booking.status, variant: "default" as const }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push(`/${role}/sessions`)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> My Sessions
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={person?.avatarUrl ?? ""} />
                <AvatarFallback>{person?.displayName?.charAt(0) ?? "?"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{booking.subject}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {role === "student" ? "Teacher: " : "Student: "}
                  {person?.displayName}
                </p>
              </div>
            </div>
            <Badge variant={statusConfig.variant} className="text-sm px-3 py-1">
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {startDate.toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric", year: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {booking.sessionType === "instant" ? "Instant" : `${startDate?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {totalActualDuration > 0 ? `${totalActualDuration} min actual` : `${booking.durationMinutes} min scheduled`}
            </span>
            {booking.amountInr && (
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {booking.amountInr.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {liveSession?.summaryText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">{liveSession.summaryText}</p>
          </CardContent>
        </Card>
      )}

      {chatMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Chat Transcript ({chatMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {chatMessages.map((msg) => {
                const isTeacher = role === "teacher" ? msg.senderId === liveSession?.bookingId : msg.senderId !== liveSession?.bookingId
                return (
                  <div key={msg.id} className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isTeacher ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p>{msg.messageText}</p>
                      <p className={`text-[10px] mt-0.5 ${isTeacher ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {practiceSet && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Practice Set
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {practiceSet.questions.length} questions generated from this session.
            </p>
            {role === "student" && (
              <Button size="sm" onClick={() => router.push("/student/practice")}>
                View Practice
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {rating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" /> Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= rating.stars
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{rating.stars}/5</span>
              {rating.comment && (
                <p className="text-sm text-muted-foreground mt-1">"{rating.comment}"</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!rating && role === "student" && booking.status === "completed" && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">You haven't rated this session yet.</p>
            <Button onClick={() => router.push(`/${role}/sessions`)}>
              Rate in My Sessions
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="text-center">
        <Button variant="outline" onClick={() => router.push(`/${role}/sessions`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sessions
        </Button>
      </div>
    </div>
  )
}
