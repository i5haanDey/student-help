"use client"

import { useState, useEffect, useRef } from "react"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionWhiteboard } from "@/components/session/session-whiteboard"
import { SessionChat } from "@/components/session/session-chat"
import { Button } from "@/components/ui/button"
import { Loader2, Monitor, MessageSquare, PenTool, LogOut, X, Clock } from "lucide-react"

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
}

export function ActiveSession({
  liveSessionId,
  token,
  livekitUrl,
  profileId,
  otherName,
  onEnd,
}: ActiveSessionProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [isEnding, setIsEnding] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startTime = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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

      await fetch(`/api/sessions/${liveSessionId}/end`, { method: "POST" })

      onEnd()
    } catch {
      onEnd()
    } finally {
      setIsEnding(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Monitor className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Live Session</span>
          <span className="text-xs text-muted-foreground font-mono tabular-nums flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>
        <Button variant="destructive" size="sm" onClick={handleEndSession} disabled={isEnding}>
          {isEnding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
          End Session
        </Button>
      </div>

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
                onDisconnected={() => {}}
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

        {/* Desktop chat sidebar */}
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

        {/* Mobile chat toggle button */}
        <button
          onClick={() => setShowMobileChat(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {/* Mobile chat drawer */}
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
