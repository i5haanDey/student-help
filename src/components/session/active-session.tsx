"use client"

import { useState, useEffect, useRef } from "react"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionWhiteboard } from "@/components/session/session-whiteboard"
import { SessionChat } from "@/components/session/session-chat"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Monitor, MessageSquare, PenTool, LogOut, X, Clock, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"

interface ActiveSessionProps {
  liveSessionId: string
  bookingId: string
  roomName: string
  token: string
  livekitUrl: string
  profileId: string
  displayName: string
  role: "student" | "teacher"
  otherName: string
  onEnd: () => void
  durationMinutes: number
  extendedByMinutes: number
  remainingSeconds: number
  extensionStatus: string | null
  isTeacherAnswer: boolean
  onExtensionAccept: () => Promise<void>
  onExtensionDeny: () => Promise<void>
}

export function ActiveSession({
  liveSessionId,
  token,
  livekitUrl,
  profileId,
  otherName,
  onEnd,
  durationMinutes,
  extendedByMinutes,
  remainingSeconds: initialRemaining,
  extensionStatus,
  isTeacherAnswer,
  onExtensionAccept,
  onExtensionDeny,
}: ActiveSessionProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [isEnding, setIsEnding] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [showExtensionBanner, setShowExtensionBanner] = useState(false)
  const [extensionActionLoading, setExtensionActionLoading] = useState(false)
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(true)
  const lastExtensionNotifRef = useRef(false)
  const disconnectPostedRef = useRef(false)

  useEffect(() => {
    setRemaining(initialRemaining)
  }, [initialRemaining])

  useEffect(() => {
    if (remaining <= 0) {
      onEnd()
      return
    }
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [remaining, onEnd])

  const totalSeconds = (durationMinutes + (extendedByMinutes ?? 0)) * 60
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 1
  const progressColor = progress > 0.25 ? "bg-primary" : progress > 0.1 ? "bg-amber-500" : "bg-destructive"

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  useEffect(() => {
    if (isTeacherAnswer && extensionStatus === "pending" && !lastExtensionNotifRef.current) {
      lastExtensionNotifRef.current = true
      setShowExtensionBanner(true)
    }
    if (extensionStatus === "accepted" || extensionStatus === "denied") {
      setShowExtensionBanner(false)
    }
  }, [extensionStatus, isTeacherAnswer])

  async function handleEndSession() {
    setIsEnding(true)
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

      if (!disconnectPostedRef.current) {
        await fetch(`/api/sessions/${liveSessionId}/disconnect`, { method: "POST" })
        disconnectPostedRef.current = true
      }

      await fetch(`/api/sessions/${liveSessionId}/end`, { method: "POST" })
      onEnd()
    } catch {
      onEnd()
    } finally {
      setIsEnding(false)
    }
  }

  function handleDisconnected() {
    setIsLiveKitConnected(false)
    if (!disconnectPostedRef.current) {
      fetch(`/api/sessions/${liveSessionId}/disconnect`, { method: "POST" })
      disconnectPostedRef.current = true
    }
    toast.info("Disconnected from session. Refreshing to reconnect...")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Monitor className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Live Session</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-mono tabular-nums">
              <Clock className="h-3 w-3" />
              <span className={remaining < 600 ? "text-destructive font-bold" : "text-muted-foreground"}>
                {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
            </div>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full ${progressColor} rounded-full transition-all duration-1000`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
          {!isLiveKitConnected && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Reconnecting...
            </span>
          )}
        </div>
        <Button variant="destructive" size="sm" onClick={handleEndSession} disabled={isEnding}>
          {isEnding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
          End Session
        </Button>
      </div>

      {showExtensionBanner && isTeacherAnswer && (
        <div className="px-4 py-3 border-b bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>
                <strong>{otherName}</strong> wants to extend the session
                {extensionStatus === "pending" && " — Respond to their request"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  setExtensionActionLoading(true)
                  await onExtensionDeny()
                  setExtensionActionLoading(false)
                  setShowExtensionBanner(false)
                }}
                disabled={extensionActionLoading}
              >
                <UserX className="h-3 w-3 mr-1" /> Deny
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  setExtensionActionLoading(true)
                  await onExtensionAccept()
                  setExtensionActionLoading(false)
                  setShowExtensionBanner(false)
                }}
                disabled={extensionActionLoading}
              >
                <UserCheck className="h-3 w-3 mr-1" /> Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="justify-start px-4 pt-2 border-b rounded-none bg-transparent gap-0 h-auto">
              <TabsTrigger value="video" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent">
                <Monitor className="h-4 w-4" /> Video
              </TabsTrigger>
              <TabsTrigger value="whiteboard" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent">
                <PenTool className="h-4 w-4" /> Whiteboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="flex-1 p-0 m-0 data-[state=active]:flex flex-col">
              <LiveKitRoom
                token={token}
                serverUrl={livekitUrl}
                connect={true}
                onDisconnected={handleDisconnected}
                className="flex-1"
              >
                <VideoConference />
              </LiveKitRoom>
            </TabsContent>

            <TabsContent value="whiteboard" className="flex-1 p-0 m-0 data-[state=active]:flex">
              <SessionWhiteboard sessionId={liveSessionId} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-80 border-l hidden lg:flex flex-col">
          <div className="p-3 border-b bg-muted/30 shrink-0">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Chat
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <SessionChat sessionId={liveSessionId} profileId={profileId} otherName={otherName} />
          </div>
        </div>

        <button
          onClick={() => setShowMobileChat(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {showMobileChat && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-background">
            <div className="flex items-center justify-between p-3 border-b shrink-0">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Chat
              </h3>
              <button
                onClick={() => setShowMobileChat(false)}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SessionChat sessionId={liveSessionId} profileId={profileId} otherName={otherName} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
