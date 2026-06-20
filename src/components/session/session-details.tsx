"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Calendar, Clock, Star, MessageSquare, Sparkles, BookOpen, IndianRupee, CheckCircle, XCircle, AlertTriangle, User, Zap } from "lucide-react"
import { motion } from "framer-motion"
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

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    mathematics: "from-blue-500 to-indigo-600",
    physics: "from-purple-500 to-pink-600",
    chemistry: "from-emerald-500 to-teal-600",
    biology: "from-green-500 to-emerald-600",
    "computer science": "from-cyan-500 to-blue-600",
    english: "from-rose-500 to-pink-600",
    history: "from-amber-500 to-orange-600",
    geography: "from-teal-500 to-cyan-600",
    economics: "from-violet-500 to-purple-600",
  }
  for (const [key, grad] of Object.entries(colors)) {
    if (subject.toLowerCase().includes(key)) return grad
  }
  return "from-primary to-primary/60"
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
        <p className="text-sm text-muted-foreground animate-pulse">Loading session details...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive/60" />
        </div>
        <p className="text-muted-foreground">Session details not found.</p>
        <Button variant="outline" onClick={() => router.push(`/${role}/sessions`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sessions
        </Button>
      </motion.div>
    )
  }

  const { booking, liveSession, chatMessages, practiceSet, rating, totalActualDuration } = data
  const person = role === "student" ? booking.teacher : booking.student
  const startDate = booking.startsAt ? new Date(booking.startsAt) : null
  const config = statusConfig[booking.status] ?? { label: booking.status, variant: "secondary" as const, icon: Clock }
  const StatusIcon = config.icon
  const grad = getSubjectColor(booking.subject)
  const initials = getInitials(person?.displayName ?? "?")

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/${role}/sessions`)} className="mb-6 group/btn">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover/btn:-translate-x-1" /> My Sessions
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-primary/10">
          <div className={`absolute inset-0 bg-gradient-to-r ${grad} opacity-[0.04]`} />
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg">
                    <AvatarImage src={person?.avatarUrl ?? ""} />
                    <AvatarFallback className={`bg-gradient-to-br ${grad} text-white text-lg font-bold`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border-2 border-background ${
                    booking.status === "completed" ? "bg-emerald-500" :
                    booking.status === "cancelled" ? "bg-destructive" : "bg-muted"
                  }`}>
                    <StatusIcon className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{booking.subject}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <User className="h-3.5 w-3.5" />
                    {role === "student" ? "Teacher" : "Student"}: {person?.displayName}
                  </p>
                </div>
              </div>
              <Badge variant={config.variant} className="self-start text-xs px-3 py-1 gap-1.5 shadow-sm">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 text-sm">
              {startDate && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{startDate.toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric", year: "numeric",
                  })}</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{totalActualDuration > 0 ? `${totalActualDuration} min` : `${booking.durationMinutes} min`}</span>
              </div>
              {booking.amountInr && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.amountInr.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <span className="text-muted-foreground capitalize">{booking.sessionType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="p-1 bg-muted/60 backdrop-blur-sm mb-6">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4" /> Overview
            </TabsTrigger>
            {chatMessages.length > 0 && (
              <TabsTrigger value="chat" className="gap-2 data-[state=active]:shadow-sm">
                <MessageSquare className="h-4 w-4" /> Chat ({chatMessages.length})
              </TabsTrigger>
            )}
            {practiceSet && (
              <TabsTrigger value="practice" className="gap-2 data-[state=active]:shadow-sm">
                <BookOpen className="h-4 w-4" /> Practice
              </TabsTrigger>
            )}
            {rating && (
              <TabsTrigger value="rating" className="gap-2 data-[state=active]:shadow-sm">
                <Star className="h-4 w-4" /> Rating
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {liveSession?.summaryText && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      AI Session Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{liveSession.summaryText}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!rating && role === "student" && booking.status === "completed" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-dashed border-primary/20 bg-gradient-to-br from-primary/[0.02] to-background">
                  <CardContent className="py-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center mb-4">
                      <Star className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="text-sm font-medium mb-1">Rate this session</p>
                    <p className="text-xs text-muted-foreground mb-4">Your feedback helps other students find great teachers.</p>
                    <Button size="sm" onClick={() => router.push(`/${role}/sessions`)}>
                      Rate in My Sessions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!liveSession?.summaryText && !rating && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No additional details available for this session.
              </div>
            )}
          </TabsContent>

          {chatMessages.length > 0 && (
            <TabsContent value="chat">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Chat Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                      {chatMessages.map((msg, i) => {
                        const isMe = role === "teacher"
                          ? msg.senderId === data.liveSession?.bookingId
                          : msg.senderId !== data.liveSession?.bookingId
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
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
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {practiceSet && (
            <TabsContent value="practice">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-primary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                      </div>
                      Practice Set
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
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
              </motion.div>
            </TabsContent>
          )}

          {rating && (
            <TabsContent value="rating">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-amber-500/10">
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
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
        <Button variant="outline" onClick={() => router.push(`/${role}/sessions`)} className="group/btn">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover/btn:-translate-x-1" /> Back to Sessions
        </Button>
      </motion.div>
    </div>
  )
}
