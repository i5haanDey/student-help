"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Star, BookOpen, IndianRupee, Globe, Clock, Award, MessageCircle } from "lucide-react"
import Link from "next/link"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"

interface TeacherDetail {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  subjects: string[]
  teachingLanguages: string[]
  hourlyRateInr: number | null
  verificationStatus: string
  compositeScore: number
  totalSessions: number
  isAvailableNow: boolean
  rank: string
  availabilitySlots: Array<{
    id: string
    slotStart: string
    slotEnd: string
  }>
  ratingsReceived: Array<{
    stars: number
    comment: string | null
    createdAt: string
  }>
}

export function TeacherProfileView() {
  const params = useParams()
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/teachers/${params.id}`)
      .then((r) => r.json())
      .then((data) => setTeacher(data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="relative overflow-hidden text-center py-20 rounded-xl border bg-card/50">
        <PatternBg variant="crosshatch" className="opacity-30" />
        <div className="relative">
          <p className="text-muted-foreground">Teacher not found.</p>
          <Button asChild className="mt-4">
            <Link href="/student/teachers">Browse Teachers</Link>
          </Button>
        </div>
      </div>
    )
  }

  const avgRating = teacher.ratingsReceived.length
    ? teacher.ratingsReceived.reduce((s, r) => s + r.stars, 0) / teacher.ratingsReceived.length
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden">
        <PatternBg variant="grid" className="opacity-30" />
        <CornerArc className="top-0 right-0" size={160} />
        <CardContent className="pt-8 relative">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 ring-2 ring-border ring-offset-2 ring-offset-background">
              <AvatarImage src={teacher.avatarUrl ?? ""} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                {teacher.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{teacher.displayName}</h1>
                  {teacher.isAvailableNow && (
                    <Badge variant="success" className="text-[10px]">Available Now</Badge>
                  )}
                  {teacher.rank && teacher.rank !== "verified" && (
                    <Badge variant="secondary" className="text-[10px]">{teacher.rank}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{teacher.bio}</p>
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(1)} ({teacher.ratingsReceived.length} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-primary" />
                  {teacher.totalSessions} sessions
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  {teacher.hourlyRateInr ?? "—"}/hr
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <PatternBg variant="dots" className="opacity-25" />
          <CardHeader className="relative">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <PatternBg variant="crosshatch" className="opacity-25" />
          <CardHeader className="relative">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-wrap gap-2">
              {teacher.teachingLanguages.map((l) => (
                <Badge key={l} variant="secondary">{l}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {teacher.availabilitySlots.length > 0 && (
        <Card className="overflow-hidden">
          <PatternBg variant="grid" className="opacity-25" />
          <CardHeader className="relative">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Available Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-2 sm:grid-cols-2">
              {teacher.availabilitySlots.slice(0, 6).map((slot) => {
                const start = new Date(slot.slotStart)
                const end = new Date(slot.slotEnd)
                return (
                  <div key={slot.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">
                        {start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {teacher.ratingsReceived.length > 0 && (
        <Card className="overflow-hidden">
          <PatternBg variant="dots" className="opacity-25" />
          <CardHeader className="relative">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            {teacher.ratingsReceived.slice(0, 5).map((r, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                <p className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {i < teacher.ratingsReceived.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button className="flex-1 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" asChild>
          <Link href={`/student/sessions/book?teacher=${teacher.id}`}>
            <MessageCircle className="h-4 w-4 mr-2" /> Book a Session
          </Link>
        </Button>
      </div>
    </div>
  )
}
