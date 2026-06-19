"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  senderId: string
  messageText: string
  createdAt: string
}

interface SessionChatProps {
  sessionId: string
  profileId: string
  otherName: string
}

export function SessionChat({ sessionId, profileId, otherName }: SessionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/chat`)
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) setMessages(data)
      } catch {
        toast.error("Failed to load messages")
      }
    }
    load()
    const interval = setInterval(load, 3000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: text, senderId: profileId }),
      })

      if (res.ok) {
        setText("")
        const reload = await fetch(`/api/sessions/${sessionId}/chat`)
        const data = await reload.json()
        if (Array.isArray(data)) setMessages(data)
      }
    } catch {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === profileId
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <p>{msg.messageText}</p>
                <p className={cn("text-[10px] mt-0.5", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${otherName}...`}
          className="h-9 text-sm"
        />
        <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isSending || !text.trim()}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
