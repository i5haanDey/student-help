"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionLobby } from "@/components/session/session-lobby"
import { ActiveSession } from "@/components/session/active-session"
import { PostSession } from "@/components/session/post-session"
import { ExtensionModal } from "@/components/session/extension-modal"
import { toast } from "sonner"
import type { SessionStatusData } from "@/types"

const POLL_INTERVAL = 3000
const EXTENSION_TRIGGER_SECONDS = 11 * 60

interface SessionData {
  id: string
  subject: string
  sessionType: string
  durationMinutes: number
  status: string
  startsAt: string | null
  student: { id: string; displayName: string }
  teacher: { id: string; displayName: string }
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
  const [status, setStatus] = useState<SessionStatusData | null>(null)
  const [showExtension, setShowExtension] = useState(false)
  const [extensionSubmitting, setExtensionSubmitting] = useState(false)
  const [graceExpired, setGraceExpired] = useState(false)
  const [disconnectedOverlay, setDisconnectedOverlay] = useState(false)
  const [disconnectTimer, setDisconnectTimer] = useState(300)
  const extensionTriggeredRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}?include=liveSession`)
        const bookingData = await res.json()
        if (!res.ok || !bookingData?.teacher || !bookingData?.student) {
          setData(null)
          return
        }
        setData(bookingData)

        if (bookingData.status === "completed") {
          setPhase("post")
        }
      } catch {
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [bookingId])

  const liveSessionId = data?.liveSession?.id
  const startPolling = useCallback(() => {
    if (!liveSessionId) return
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${liveSessionId}/check-status`)
        const statusData: SessionStatusData = await res.json()
        setStatus(statusData)

        if (statusData.graceExpired && !graceExpired) {
          setGraceExpired(true)
        }

        if (statusData.phase === "admitted" && role === "student" && phase === "lobby") {
          setPhase("lobby")
        }

        if (statusData.disconnectedAt) {
          setDisconnectedOverlay(true)
          const disconnectedTime = new Date(statusData.disconnectedAt).getTime()
          const elapsed = Math.floor((Date.now() - disconnectedTime) / 1000)
          setDisconnectTimer(Math.max(0, 300 - elapsed))
        }

        if (!statusData.extensionExpiresAt && statusData.extensionStatus === "pending" && showExtension) {
          setShowExtension(false)
          toast.info("Extension request timed out")
        }
      } catch {
        // poll error
      }
    }, POLL_INTERVAL)
  }, [liveSessionId, graceExpired, phase, role, showExtension])

  useEffect(() => {
    const hasLiveSession = !!liveSessionId && data?.status !== "completed"
    if (hasLiveSession && phase !== "post") {
      startPolling()
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [liveSessionId, data?.status, phase, startPolling])

  useEffect(() => {
    if (!status || !liveSessionId || status.phase !== "active") return
    if (role !== "student") return
    if (extensionTriggeredRef.current) return
    if (status.extensionStatus !== "none" && status.extensionStatus !== "denied") return

    if (status.remainingSeconds <= EXTENSION_TRIGGER_SECONDS && status.remainingSeconds > 0) {
      extensionTriggeredRef.current = true
      setShowExtension(true)
    }
  }, [status, liveSessionId, role])

  useEffect(() => {
    if (disconnectedOverlay && disconnectTimer <= 0) {
      handleEndSession()
    }
  }, [disconnectTimer, disconnectedOverlay])

  async function handleJoin() {
    if (!data?.liveSession?.roomName || !liveSessionId) {
      toast.error("Session not set up yet.")
      return
    }

    await fetch(`/api/sessions/${liveSessionId}/join`, { method: "POST" })

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
    if (pollRef.current) clearInterval(pollRef.current)
  }

  async function handleAdmit() {
    if (!liveSessionId) return
    const res = await fetch(`/api/sessions/${liveSessionId}/admit`, { method: "POST" })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error)
    }
    toast.success("Student admitted!")
  }

  async function handleExtension(minutes: number) {
    if (!liveSessionId) return
    setExtensionSubmitting(true)
    try {
      const res = await fetch(`/api/sessions/${liveSessionId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedMinutes: minutes }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast.success("Extension request sent to teacher!")
      setShowExtension(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request extension")
    } finally {
      setExtensionSubmitting(false)
    }
  }

  async function handleEndSession() {
    if (!liveSessionId) return
    try {
      const saveSnapshot = (window as unknown as { __saveWhiteboardSnapshot?: () => Promise<unknown> }).__saveWhiteboardSnapshot
      if (saveSnapshot) {
        const snapshot = await saveSnapshot()
        if (snapshot) {
          await fetch(`/api/sessions/${liveSessionId}/whiteboard`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ snapshot }),
          })
        }
      }
      await fetch(`/api/sessions/${liveSessionId}/end`, { method: "POST" })
      setPhase("post")
      setDisconnectedOverlay(false)
    } catch {
      setPhase("post")
      setDisconnectedOverlay(false)
    }
  }

  const otherName = data
    ? role === "student" ? data.teacher.displayName : data.student.displayName
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

  if (disconnectedOverlay) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <WifiOff className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Connection Lost</h2>
          <p className="text-muted-foreground">
            You've been disconnected. The session will end if you don't reconnect within{" "}
            <span className="font-mono font-bold text-foreground">{disconnectTimer}</span> seconds.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Reconnecting
            </Button>
            <Button variant="outline" onClick={handleEndSession}>
              End Session
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === "active" && liveToken && data.liveSession) {
    return (
      <>
        <ActiveSession
          liveSessionId={data.liveSession.id}
          bookingId={data.id}
          roomName={data.liveSession.roomName ?? ""}
          token={liveToken}
          livekitUrl={livekitUrl}
          profileId={profileId}
          displayName={role === "student" ? data.student.displayName : data.teacher.displayName}
          role={role}
          otherName={otherName}
          onEnd={handleEndSession}
          durationMinutes={data.durationMinutes}
          extendedByMinutes={status?.remainingSeconds
            ? Math.max(0, Math.floor(
                (data.durationMinutes * 60) +
                (status.remainingSeconds > data.durationMinutes * 60
                  ? status.remainingSeconds - data.durationMinutes * 60
                  : 0)
              ) / 60)
            : 0}
          remainingSeconds={status?.remainingSeconds ?? data.durationMinutes * 60}
          extensionStatus={status?.extensionStatus ?? null}
          isTeacherAnswer={role === "teacher"}
          onExtensionAccept={async () => {
            if (!liveSessionId) return
            await fetch(`/api/sessions/${liveSessionId}/extend`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "accept" }),
            })
            toast.success("Extension accepted!")
          }}
          onExtensionDeny={async () => {
            if (!liveSessionId) return
            await fetch(`/api/sessions/${liveSessionId}/extend`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "deny" }),
            })
            toast.success("Extension denied.")
          }}
        />
        {showExtension && role === "student" && (
          <ExtensionModal
            isOpen={showExtension}
            onClose={() => setShowExtension(false)}
            onConfirm={handleExtension}
            hourlyRate={500}
            isSubmitting={extensionSubmitting}
          />
        )}
      </>
    )
  }

  if (phase === "post") {
    return (
      <PostSession
        liveSessionId={data.liveSession?.id ?? ""}
        role={role}
        subject={data.subject}
        bookingId={data.id}
      />
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SessionLobby
        bookingId={data.id}
        liveSessionId={data.liveSession?.id ?? ""}
        subject={data.subject}
        teacherName={data.teacher.displayName}
        studentName={data.student.displayName}
        role={role}
        onJoin={handleJoin}
        onAdmit={handleAdmit}
        phase={phase}
        teacherJoined={status?.teacherJoined ?? false}
        admitted={status?.admitted ?? false}
        graceRemainingSeconds={status?.graceRemainingSeconds ?? 0}
        graceExpired={graceExpired}
        studentNameForTeacher={data.student.displayName}
        hourlyRate={500}
        onGraceExpired={() => setGraceExpired(true)}
      />
    </div>
  )
}
