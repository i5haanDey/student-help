"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Video, VideoOff, Mic, MicOff, Monitor } from "lucide-react"
import { toast } from "sonner"

interface SessionLobbyProps {
  bookingId: string
  subject: string
  teacherName: string
  studentName: string
  role: "student" | "teacher"
  onJoin: () => Promise<void>
}

export function SessionLobby({ bookingId, subject, teacherName, studentName, role, onJoin }: SessionLobbyProps) {
  const [isJoining, setIsJoining] = useState(false)
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

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Monitor className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Ready to Join?</CardTitle>
        <CardDescription>
          {role === "student"
            ? `You are about to join a session with ${teacherName}`
            : `Your student ${studentName} is waiting for you`}
        </CardDescription>
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
        </div>

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

        <Button
          className="w-full h-12 text-base"
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Joining...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Join Session
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
