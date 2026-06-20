"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Video, VideoOff, Mic, MicOff, Monitor, UserCheck, UserX, Clock, AlertCircle } from "lucide-react"
import { GraceTimer } from "@/components/session/grace-timer"
import { toast } from "sonner"

interface SessionLobbyProps {
  bookingId: string
  liveSessionId: string
  subject: string
  teacherName: string
  studentName: string
  role: "student" | "teacher"
  onJoin: () => Promise<void>
  onAdmit: () => Promise<void>
  phase: string
  teacherJoined: boolean
  admitted: boolean
  graceRemainingSeconds: number
  graceExpired: boolean
  studentNameForTeacher: string
  hourlyRate: number
  onGraceExpired: () => void
}

export function SessionLobby({
  bookingId,
  subject,
  teacherName,
  studentName,
  role,
  onJoin,
  onAdmit,
  phase,
  teacherJoined,
  admitted,
  graceRemainingSeconds,
  graceExpired,
  studentNameForTeacher,
  onGraceExpired,
}: SessionLobbyProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [isAdmitting, setIsAdmitting] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)

  async function handleJoin() {
    setIsJoining(true)
    try {
      await onJoin()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join session")
      setIsJoining(false)
    }
  }

  async function handleAdmit() {
    setIsAdmitting(true)
    try {
      await onAdmit()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to admit student")
      setIsAdmitting(false)
    }
  }

  if (graceExpired && role === "student") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Teacher Didn't Join</CardTitle>
          <CardDescription>
            The teacher didn't join within the grace period. A full refund has been issued.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => window.location.href = "/student/teachers"}>
              Find Another Teacher
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.location.href = "/student/ask"}>
              Try AI Solver
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => window.location.href = "/student/sessions"}>
            Back to Sessions
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (graceExpired && role === "teacher") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Grace Period Expired</CardTitle>
          <CardDescription>
            The student didn't join within the grace period. Session has been cancelled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => window.location.href = "/teacher/sessions"}>
            Back to Sessions
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Monitor className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">
          {role === "student"
            ? teacherJoined
              ? admitted
                ? "Your Session is Ready!"
                : "Waiting for Teacher..."
              : "Waiting for Teacher..."
            : teacherJoined
              ? "Waiting for Student..."
              : "Ready to Start?"
          }
        </CardTitle>
        <CardDescription>
          {role === "student"
            ? teacherJoined
              ? admitted
                ? `You can now join ${teacherName}`
                : `${teacherName} is setting up the session...`
              : `Waiting for ${teacherName} to start the session...`
            : teacherJoined
              ? `Waiting for ${studentNameForTeacher} to join...`
              : `Your student ${studentNameForTeacher} is waiting`
          }
        </CardDescription>
        {graceRemainingSeconds > 0 && (
          <div className="flex justify-center mt-2">
            <GraceTimer
              remainingSeconds={graceRemainingSeconds}
              onExpired={onGraceExpired}
              label="Time remaining to join"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subject</span>
            <span className="font-medium">{subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session ID</span>
            <span className="font-medium font-mono text-xs">{bookingId.slice(0, 8)}...</span>
          </div>
          {role === "teacher" && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Status</span>
              <span className="font-medium flex items-center gap-1">
                {admitted ? (
                  <><UserCheck className="h-3 w-3 text-emerald-500" /> Joined</>
                ) : (
                  <><UserX className="h-3 w-3 text-muted-foreground" /> Not joined</>
                )}
              </span>
            </div>
          )}
        </div>

        {role === "teacher" && !teacherJoined && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-col gap-1 h-auto py-4 px-6"
              onClick={() => setMicEnabled(!micEnabled)}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-destructive" />}
              <span className="text-xs">{micEnabled ? "Mic On" : "Mic Off"}</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-col gap-1 h-auto py-4 px-6"
              onClick={() => setCameraEnabled(!cameraEnabled)}
            >
              {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-destructive" />}
              <span className="text-xs">{cameraEnabled ? "Camera On" : "Camera Off"}</span>
            </Button>
          </div>
        )}

        {role === "teacher" && !teacherJoined && (
          <Button className="w-full h-12 text-base" onClick={handleJoin} disabled={isJoining}>
            {isJoining ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting...</>
            ) : (
              <><Video className="h-4 w-4 mr-2" /> Start Session</>
            )}
          </Button>
        )}

        {role === "teacher" && teacherJoined && !admitted && (
          <Button className="w-full h-12 text-base" onClick={handleAdmit} disabled={isAdmitting}>
            {isAdmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Admitting...</>
            ) : (
              <><UserCheck className="h-4 w-4 mr-2" /> Admit Student</>
            )}
          </Button>
        )}

        {role === "teacher" && teacherJoined && admitted && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Student has been admitted. Waiting for them to join...</p>
          </div>
        )}

        {role === "student" && teacherJoined && admitted && (
          <Button className="w-full h-12 text-base" onClick={handleJoin} disabled={isJoining}>
            {isJoining ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Joining...</>
            ) : (
              <><Video className="h-4 w-4 mr-2" /> Join Now</>
            )}
          </Button>
        )}

        {role === "student" && (!teacherJoined || !admitted) && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {!teacherJoined
                ? "Waiting for teacher to start the session..."
                : "Waiting for teacher to admit you..."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
