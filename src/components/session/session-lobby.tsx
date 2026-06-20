"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Video, VideoOff, Mic, MicOff, Monitor, UserCheck, UserX, Clock, AlertCircle, Shield, Users, RefreshCw } from "lucide-react"
import { GraceTimer } from "@/components/session/grace-timer"
import { motion, AnimatePresence } from "framer-motion"
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
  const grad = getSubjectColor(subject)
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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-auto">
        <Card className="relative overflow-hidden border-destructive/20">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
          <CardHeader className="text-center relative">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 mb-4 ring-1 ring-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Teacher Didn't Join</CardTitle>
            <CardDescription className="text-base">
              The teacher didn't join within the grace period. A full refund has been issued.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="flex gap-3">
              <Button className="flex-1 gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.href = "/student/teachers"}>
                <Users className="h-4 w-4" /> Find Another Teacher
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => window.location.href = "/student/ask"}>
                <RefreshCw className="h-4 w-4" /> Try AI Solver
              </Button>
            </div>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => window.location.href = "/student/sessions"}>
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (graceExpired && role === "teacher") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-auto">
        <Card className="relative overflow-hidden border-destructive/20">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
          <CardHeader className="text-center relative">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 mb-4 ring-1 ring-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Grace Period Expired</CardTitle>
            <CardDescription className="text-base">
              The student didn't join within the grace period. Session has been cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/teacher/sessions"}>
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="relative overflow-hidden border-primary/10 shadow-xl shadow-primary/5">
        <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-[0.03]`} />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

        <CardHeader className="text-center relative">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} mb-4 shadow-lg shadow-primary/20 ring-2 ring-background`}>
            {waitingForTeacher ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Monitor className="h-8 w-8 text-white" />
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

        <CardContent className="space-y-5 relative">
          <div className="rounded-xl border bg-background/50 backdrop-blur-sm p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <div className={`p-0.5 rounded bg-gradient-to-r ${grad}`}>
                  <BookOpenIcon className="h-3.5 w-3.5 text-white" />
                </div>
                Subject
              </span>
              <span className="font-medium flex items-center gap-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r ${grad} text-white`}>
                  {subject}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Session ID
              </span>
              <span className="font-mono text-xs text-muted-foreground">{bookingId.slice(0, 10)}...</span>
            </div>
            {role === "teacher" && (
              <div className="flex items-center justify-between pt-1 border-t">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Student Status
                </span>
                <span className="font-medium flex items-center gap-1.5">
                  {admitted ? (
                    <><UserCheck className="h-4 w-4 text-emerald-500" /> Has joined</>
                  ) : (
                    <><UserX className="h-4 w-4 text-muted-foreground" /> Not joined</>
                  )}
                </span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {role === "teacher" && !teacherJoined && (
              <motion.div key="teacher-pre" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className={`flex-col gap-1 h-auto py-4 px-6 transition-all ${!micEnabled ? "border-destructive bg-destructive/5" : ""}`}
                    onClick={() => setMicEnabled(!micEnabled)}
                  >
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-destructive" />}
                    <span className="text-xs">{micEnabled ? "Mic On" : "Mic Off"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`flex-col gap-1 h-auto py-4 px-6 transition-all ${!cameraEnabled ? "border-destructive bg-destructive/5" : ""}`}
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                  >
                    {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-destructive" />}
                    <span className="text-xs">{cameraEnabled ? "Camera On" : "Camera Off"}</span>
                  </Button>
                </div>
                <Button className="w-full h-12 text-base shadow-lg shadow-primary/20" onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting...</>
                  ) : (
                    <><Video className="h-4 w-4 mr-2" /> Start Session</>
                  )}
                </Button>
              </motion.div>
            )}

            {role === "teacher" && teacherJoined && !admitted && (
              <motion.div key="teacher-admit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Button
                  className="w-full h-12 text-base shadow-lg shadow-primary/20 relative overflow-hidden group"
                  onClick={handleAdmit}
                  disabled={isAdmitting}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isAdmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Admitting...</>
                  ) : (
                    <><UserCheck className="h-4 w-4 mr-2" /> Admit Student</>
                  )}
                </Button>
              </motion.div>
            )}

            {role === "teacher" && teacherJoined && admitted && (
              <motion.div key="teacher-waiting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-6">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div>
                    <p className="text-sm font-medium">Student has been admitted</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Waiting for them to join the session...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {role === "student" && teacherJoined && admitted && (
              <motion.div key="student-join" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Button
                  className="w-full h-12 text-base shadow-lg shadow-primary/20 relative overflow-hidden group"
                  onClick={handleJoin}
                  disabled={isJoining}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isJoining ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Joining...</>
                  ) : (
                    <><Video className="h-4 w-4 mr-2" /> Join Now</>
                  )}
                </Button>
              </motion.div>
            )}

            {role === "student" && (!teacherJoined || !admitted) && (
              <motion.div key="student-waiting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                  </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
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
