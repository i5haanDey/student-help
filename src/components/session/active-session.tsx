"use client"

import { useState, useEffect, useRef } from "react"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionWhiteboard } from "@/components/session/session-whiteboard"
import { SessionChat } from "@/components/session/session-chat"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Monitor, MessageSquare, PenTool, LogOut, X, Clock, UserCheck, UserX, Wifi, WifiOff, ChevronDown } from "lucide-react"
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
  bookingId,
  roomName,
  token,
  livekitUrl,
  profileId,
  displayName,
  role,
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
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [showExtensionBanner, setShowExtensionBanner] = useState(false)
  const [extensionActionLoading, setExtensionActionLoading] = useState(false)
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(true)
  const [showTimerDetail, setShowTimerDetail] = useState(false)
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
  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  const progressColor = progress > 0.3 ? "bg-primary" : progress > 0.1 ? "bg-amber-500" : "bg-destructive"

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
    setShowEndConfirm(false)
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
    toast.error("Connection lost. Trying to reconnect...")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-muted">
              {isLiveKitConnected ? (
                <Wifi className="h-4 w-4 text-muted-foreground" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
            </div>
            <div>
              <span className="font-semibold text-sm">Live Session</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{otherName}</span>
                {!isLiveKitConnected && (
                  <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4">Disconnected</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setShowTimerDetail(true)}
            onMouseLeave={() => setShowTimerDetail(false)}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
              <Clock className={`h-4 w-4 ${remaining < 600 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className={`font-mono text-base font-bold tabular-nums ${
                remaining < 300 ? "text-destructive" :
                remaining < 600 ? "text-amber-500" : "text-foreground"
              }`}>
                {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
            {showTimerDetail && (
              <div className="absolute top-full mt-2 right-0 bg-popover border rounded-lg p-3 shadow-xl z-50 min-w-[220px]">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span>{durationMinutes} min</span>
                  </div>
                  {extendedByMinutes > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Extended</span>
                      <span>+{extendedByMinutes} min</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total</span>
                    <span>{durationMinutes + extendedByMinutes} min</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${progressColor} transition-all duration-1000`}
                      style={{ width: `${(1 - progress) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowEndConfirm(true)}
          >
            <LogOut className="h-4 w-4 mr-1" /> End
          </Button>
        </div>
      </div>

      {/* Extension banner */}
      {showExtensionBanner && isTeacherAnswer && (
        <div className="overflow-hidden border-b bg-muted/50">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm min-w-0">
              <div className="p-1.5 rounded-lg bg-muted shrink-0">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {otherName} wants to extend
                </p>
                {extensionStatus === "pending" && (
                  <p className="text-xs text-muted-foreground">Respond to their request</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
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

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="justify-start px-4 pt-2 border-b rounded-none bg-transparent gap-0 h-auto pb-0">
              <TabsTrigger value="video" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2">
                <Monitor className="h-4 w-4" /> Video
              </TabsTrigger>
              <TabsTrigger value="whiteboard" className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2">
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

        {/* Desktop chat */}
        <div className="w-80 border-l hidden lg:flex flex-col bg-muted/10">
          <div className="p-3 border-b bg-background shrink-0 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Chat</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <SessionChat sessionId={liveSessionId} profileId={profileId} otherName={otherName} />
          </div>
        </div>

        {/* Mobile chat FAB */}
        <button
          onClick={() => setShowMobileChat(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>

        {/* Mobile chat drawer */}
        {showMobileChat && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-background">
            <div className="flex items-center justify-between p-3 border-b bg-background shrink-0">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" /> Chat
              </h3>
              <button
                onClick={() => setShowMobileChat(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
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

      {/* End session confirmation */}
      <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Session?</DialogTitle>
            <DialogDescription>
              The whiteboard will be saved and the session summary will be generated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEndConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEndSession} disabled={isEnding}>
              {isEnding ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Ending...</> : "End Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
