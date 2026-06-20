"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sparkles, ArrowLeft, CheckCircle, BookOpen, Star, Zap, Eye } from "lucide-react"
import { toast } from "sonner"

interface PostSessionProps {
  liveSessionId: string
  role: "student" | "teacher"
  subject?: string
  bookingId?: string
}

export function PostSession({ liveSessionId, role, subject, bookingId }: PostSessionProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(true)
  const [summary, setSummary] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false)
  const [isRated, setIsRated] = useState(false)
  const [practiceLoading, setPracticeLoading] = useState(false)

  useEffect(() => {
    async function generate() {
      try {
        const res = await fetch(`/api/sessions/${liveSessionId}/summary`, { method: "POST" })
        if (!res.ok) throw new Error("Failed to generate summary")
        const data = await res.json()
        setSummary(data.summary)
      } catch {
        setSummary("Session summary could not be generated. Please try again later.")
      } finally {
        setIsGenerating(false)
      }
    }
    generate()
  }, [liveSessionId])

  async function handleRate() {
    if (rating === 0) return
    setIsRatingSubmitting(true)
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: liveSessionId, stars: rating, comment: "" }),
      })
      if (res.ok) {
        setIsRated(true)
        toast.success("Rating submitted!")
      } else {
        const data = await res.json()
        toast.error(data.error ?? "Failed to submit rating")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsRatingSubmitting(false)
    }
  }

  async function handleGeneratePractice() {
    setPracticeLoading(true)
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: liveSessionId, subject: subject ?? "General" }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Practice set generated!")
      router.push("/student/practice")
    } catch {
      toast.error("Failed to generate practice")
    } finally {
      setPracticeLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl">Session Completed</CardTitle>
          <CardDescription>
            {role === "student"
              ? "Great session! Here's your AI-generated summary."
              : "Session ended. Summary and practice suggestions are ready."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating session summary...</p>
            </div>
          ) : (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Session Summary
              </div>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">{summary}</p>
            </div>
          )}

          {role === "student" && !isRated && !isGenerating && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" /> Rate Your Session
              </h3>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleRate}
                disabled={rating === 0 || isRatingSubmitting}
              >
                {isRatingSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Rating"}
              </Button>
            </div>
          )}

          {role === "student" && isRated && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center text-sm text-emerald-700 dark:text-emerald-300">
              Thanks for your rating!
            </div>
          )}

          {role === "student" && !isGenerating && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGeneratePractice}
              disabled={practiceLoading}
            >
              {practiceLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Generate Practice Questions
            </Button>
          )}

          {!isGenerating && bookingId && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push(`/${role}/sessions/${bookingId}/details`)}
            >
              <Eye className="h-4 w-4 mr-2" /> View Full Session Details
            </Button>
          )}

          <Separator />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push(`/${role}/sessions`)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> My Sessions
            </Button>
            {role === "student" && (
              <Button className="flex-1" onClick={() => router.push("/student/teachers")}>
                <BookOpen className="h-4 w-4 mr-2" /> Find a Teacher
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
