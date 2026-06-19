"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionLobby } from "@/components/session/session-lobby"
import { ActiveSession } from "@/components/session/active-session"
import { PostSession } from "@/components/session/post-session"

interface SessionData {
  booking: {
    id: string
    subject: string
    sessionType: string
    durationMinutes: number
    status: string
    startsAt: string | null
    student: { id: string; displayName: string }
    teacher: { id: string; displayName: string }
  }
  liveSession: {
    id: string
    roomName: string | null
  } | null
}

interface SessionPageProps {
  role: "student" | "teacher"
  bookingId: string
  profileId: string
}

export function SessionPage({ role, bookingId, profileId }: SessionPageProps) {
  const router = useRouter()
  const [data, setData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [phase, setPhase] = useState<"lobby" | "active" | "post">("lobby")
  const [liveToken, setLiveToken] = useState<string | null>(null)
  const [livekitUrl, setLivekitUrl] = useState<string>("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}?include=liveSession`)
        const bookingData = await res.json()
        setData(bookingData)

        if (bookingData.status === "completed") {
          setPhase("post")
        }
      } catch {
        // error handled below
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [bookingId])

  async function handleJoin() {
    if (!data?.liveSession?.roomName) return

    const tokenRes = await fetch("/api/livekit/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: data.liveSession.roomName }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokenData.error)

    setLiveToken(tokenData.token)
    setLivekitUrl(tokenData.url)
    setPhase("active")

    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress" }),
    })

    await fetch(`/api/sessions/${data.liveSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startedAt: new Date().toISOString() }),
    })
  }

  const otherName = data
    ? role === "student" ? data.booking.teacher.displayName : data.booking.student.displayName
    : ""

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <p className="text-muted-foreground">Session not found.</p>
        <Button onClick={() => router.push(`/${role}/sessions`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sessions
        </Button>
      </div>
    )
  }

  if (phase === "active" && liveToken && data.liveSession) {
    return (
      <ActiveSession
        liveSessionId={data.liveSession.id}
        bookingId={data.booking.id}
        roomName={data.liveSession.roomName ?? ""}
        token={liveToken}
        livekitUrl={livekitUrl}
        profileId={profileId}
        displayName={role === "student" ? data.booking.student.displayName : data.booking.teacher.displayName}
        role={role}
        otherName={otherName}
        onEnd={() => setPhase("post")}
      />
    )
  }

  if (phase === "post") {
    return (
      <PostSession
        liveSessionId={data.liveSession?.id ?? ""}
        role={role}
        subject={data.booking.subject}
      />
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SessionLobby
        bookingId={data.booking.id}
        subject={data.booking.subject}
        teacherName={data.booking.teacher.displayName}
        studentName={data.booking.student.displayName}
        role={role}
        onJoin={handleJoin}
      />
    </div>
  )
}
