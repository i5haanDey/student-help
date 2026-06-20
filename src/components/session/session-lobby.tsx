"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Video, VideoOff, Mic, MicOff, Monitor, UserCheck, UserX, Clock, AlertCircle, Shield, Users } from "lucide-react"
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
  const awaitingStudent = teacherJoined && admitted
  const waitingForTeacher = role === "student" && (!teacherJoined || !admitted)

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
      <div className="w-full max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-5">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Teacher Didn't Join</CardTitle>
            <CardDescription className="text-base">
              The teacher didn't join within the grace period. A full refund has been issued.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => window.location.href = "/student/teachers"}>
                <Users className="h-4 w-4 mr-2" /> Find Another Teacher
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = "/student/ask"}>
                Try AI Solver
              </Button>
            </div>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => window.location.href = "/student/sessions"}>
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (graceExpired && role === "teacher") {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-5">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Grace Period Expired</CardTitle>
            <CardDescription className="text-base">
              The student didn't join within the grace period. Session has been cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/teacher/sessions"}>
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5">
            {waitingForTeacher ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <Monitor className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {role === "student"
              ? teacherJoined
                ? admitted
                  ? "Ready to Learn!"
                  : "Waiting for Teacher"
                : "Waiting for Teacher"
              : teacherJoined
                ? awaitingStudent
                  ? "Student Admitted"
                  : "Waiting for Student"
                : "Ready to Start?"
            }
          </CardTitle>
          <CardDescription className="text-base">
            {role === "student"
              ? teacherJoined
                ? admitted
                  ? `You can now join ${teacherName} in the session`
                  : `${teacherName} is setting things up...`
                : `${teacherName} hasn't joined yet. Hang tight!`
              : teacherJoined
                ? awaitingStudent
                  ? `${studentNameForTeacher} can join now. Waiting for them...`
                  : `Waiting for ${studentNameForTeacher} to be admitted...`
                : `Your student ${studentNameForTeacher} is waiting for you to start`
            }
          </CardDescription>
          {graceRemainingSeconds > 0 && (
            <div className="flex justify-center mt-3">
              <GraceTimer remainingSeconds={graceRemainingSeconds} onExpired={onGraceExpired} />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <BookOpenIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Subject
              </span>
              <span className="font-medium">{subject}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Session ID
              </span>
              <span className="font-mono text-xs text-muted-foreground">{bookingId.slice(0, 10)}...</span>
            </div>
            {role === "teacher" && (
              <div className="flex items-center justify-between pt-2 border-t border-dashed">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Student Status
                </span>
                <span className="font-medium flex items-center gap-1.5">
                  {admitted ? (
                    <><UserCheck className="h-4 w-4 text-green-600" /> Has joined</>
                  ) : (
                    <><UserX className="h-4 w-4 text-muted-foreground" /> Not joined</>
                  )}
                </span>
              </div>
            )}
          </div>

          {role === "teacher" && !teacherJoined && (
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className={`flex-col gap-1 h-auto py-4 px-6 transition-colors ${!micEnabled ? "border-destructive/50 bg-destructive/5" : ""}`}
                  onClick={() => setMicEnabled(!micEnabled)}
                >
                  {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-destructive" />}
                  <span className="text-xs">{micEnabled ? "Mic On" : "Mic Off"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`flex-col gap-1 h-auto py-4 px-6 transition-colors ${!cameraEnabled ? "border-destructive/50 bg-destructive/5" : ""}`}
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                >
                  {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-destructive" />}
                  <span className="text-xs">{cameraEnabled ? "Camera On" : "Camera Off"}</span>
                </Button>
              </div>
              <Button className="w-full h-12 text-base shadow-sm" onClick={handleJoin} disabled={isJoining}>
                {isJoining ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting...</>
                ) : (
                  <><Video className="h-4 w-4 mr-2" /> Start Session</>
                )}
              </Button>
            </div>
          )}

          {role === "teacher" && teacherJoined && !admitted && (
            <Button className="w-full h-12 text-base shadow-sm" onClick={handleAdmit} disabled={isAdmitting}>
              {isAdmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Admitting...</>
              ) : (
                <><UserCheck className="h-4 w-4 mr-2" /> Admit Student</>
              )}
            </Button>
          )}

          {role === "teacher" && teacherJoined && admitted && (
            <div className="text-center py-6">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                <div>
                  <p className="text-sm font-medium">Student has been admitted</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Waiting for them to join the session...</p>
                </div>
              </div>
            </div>
          )}

          {role === "student" && teacherJoined && admitted && (
            <Button className="w-full h-12 text-base shadow-sm" onClick={handleJoin} disabled={isJoining}>
              {isJoining ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Joining...</>
              ) : (
                <><Video className="h-4 w-4 mr-2" /> Join Now</>
              )}
            </Button>
          )}

          {role === "student" && (!teacherJoined || !admitted) && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                <div>
                  <p className="text-sm font-medium">
                    {!teacherJoined
                      ? "Waiting for teacher to start..."
                      : "Waiting for teacher to admit you..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {!teacherJoined
                      ? `${teacherName} will be notified that you're here`
                      : `${teacherName} is reviewing your request`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
