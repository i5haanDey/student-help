"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Calendar, Clock, Star, MessageSquare, Sparkles, BookOpen, IndianRupee, CheckCircle, XCircle, AlertTriangle, User, Zap } from "lucide-react"
import type { SessionDetails } from "@/types"

interface SessionDetailsViewProps {
  bookingId: string
  role: "student" | "teacher"
}

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "secondary" | "default"; icon: typeof CheckCircle }> = {
  completed: { label: "Completed", variant: "success", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
  disputed: { label: "Disputed", variant: "destructive", icon: AlertTriangle },
  confirmed: { label: "Confirmed", variant: "warning", icon: Clock },
  in_progress: { label: "In Progress", variant: "default", icon: Zap },
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function SessionDetailsView({ bookingId, role }: SessionDetailsViewProps) {
  const router = useRouter()
  const [data, setData] = useState<SessionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading session details...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-xl border bg-muted/50 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <p className="text-muted-foreground">Session details not found.</p>
        <Button variant="outline" onClick={() => router.push(`/${role}/sessions`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sessions
        </Button>
      </div>
    )
  }

  const { booking, liveSession, chatMessages, practiceSet, rating, totalActualDuration } = data
  const person = role === "student" ? booking.teacher : booking.student
  const startDate = booking.startsAt ? new Date(booking.startsAt) : null
  const config = statusConfig[booking.status] ?? { label: booking.status, variant: "secondary" as const, icon: Clock }
  const StatusIcon = config.icon
  const initials = getInitials(person?.displayName ?? "?")
  const displayName = person?.displayName ?? "Unknown"

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => router.push(`/${role}/sessions`)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> My Sessions
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={person?.avatarUrl ?? ""} />
                  <AvatarFallback className="bg-muted text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{booking.subject}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                  {role === "student" ? "Teacher" : "Student"}: {displayName}
                </p>
              </div>
            </div>
            <Badge variant={config.variant} className="self-start text-xs px-3 py-1 gap-1.5">
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 text-sm">
            {startDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{startDate.toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric", year: "numeric",
                })}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{totalActualDuration > 0 ? `${totalActualDuration} min` : `${booking.durationMinutes} min`}</span>
            </div>
            {booking.amountInr && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <span>{booking.amountInr.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <span className="text-muted-foreground capitalize">{booking.sessionType}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Sparkles className="h-4 w-4" /> Overview
            </TabsTrigger>
            {chatMessages.length > 0 && (
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Chat ({chatMessages.length})
              </TabsTrigger>
            )}
            {practiceSet && (
              <TabsTrigger value="practice" className="gap-2">
                <BookOpen className="h-4 w-4" /> Practice
              </TabsTrigger>
            )}
            {rating && (
              <TabsTrigger value="rating" className="gap-2">
                <Star className="h-4 w-4" /> Rating
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {liveSession?.summaryText && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    AI Session Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{liveSession.summaryText}</p>
                </CardContent>
              </Card>
            )}

            {!rating && role === "student" && booking.status === "completed" && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">Rate this session</p>
                  <p className="text-xs text-muted-foreground mb-4">Your feedback helps other students find great teachers.</p>
                  <Button size="sm" onClick={() => router.push(`/${role}/sessions`)}>
                    Rate in My Sessions
                  </Button>
                </CardContent>
              </Card>
            )}

            {!liveSession?.summaryText && !rating && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No additional details available for this session.
              </div>
            )}
          </TabsContent>

          {chatMessages.length > 0 && (
            <TabsContent value="chat">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Chat Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {chatMessages.map((msg) => {
                      const isMe = role === "teacher"
                        ? msg.senderId === data.liveSession?.bookingId
                        : msg.senderId !== data.liveSession?.bookingId
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          }`}>
                            <p>{msg.messageText}</p>
                            <p className={`text-[10px] mt-1 ${
                              isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {practiceSet && (
            <TabsContent value="practice">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Practice Set
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="p-2 rounded-lg bg-muted">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{practiceSet.questions.length} Questions</p>
                      <p className="text-xs text-muted-foreground">
                        Tier: {practiceSet.status} &middot; {practiceSet.conceptTags.length} concepts
                      </p>
                    </div>
                  </div>
                  {role === "student" && (
                    <Button onClick={() => router.push("/student/practice")}>
                      <Zap className="h-4 w-4 mr-2" /> Start Practice
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {rating && (
            <TabsContent value="rating">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" />
                    {role === "student" ? "Your Rating" : "Rating Received"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-7 w-7 ${
                            star <= rating.stars
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold">{rating.stars}/5</span>
                  </div>
                  {rating.comment && (
                    <div className="p-3 rounded-lg bg-muted/30 italic text-sm text-muted-foreground">
                      &ldquo;{rating.comment}&rdquo;
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => router.push(`/${role}/sessions`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sessions
        </Button>
      </div>
    </div>
  )
}
