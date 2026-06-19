"use client"

import { useState } from "react"
import { DoubtInput } from "@/components/doubt/doubt-input"
import { AiResponse } from "@/components/doubt/ai-response"
import { ExplainModes } from "@/components/doubt/explain-modes"
import { AsyncQueue } from "@/components/doubt/async-queue"
import { EmergencyRoomPlaceholder } from "@/components/dummy/emergency-room-placeholder"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap } from "lucide-react"
import { toast } from "sonner"
import type { AiResponse as AiResponseType } from "@/types"

interface QueueItem {
  id: string
  question: string
  submittedAt: string
  status: "queued" | "processing" | "resolved"
}

export function DoubtSolver() {
  const [response, setResponse] = useState<AiResponseType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [lastDoubtText, setLastDoubtText] = useState("")

  async function handleSubmit(text: string, file: File | null) {
    setIsLoading(true)
    setResponse(null)
    setLastDoubtText(text)

    try {
      const formData = new FormData()
      formData.append("text", text)
      if (file) formData.append("image", file)

      const res = await fetch("/api/doubt/solve", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.async) {
          setQueue((prev) => [
            ...prev,
            {
              id: data.id,
              question: text.slice(0, 60) + (text.length > 60 ? "..." : ""),
              submittedAt: new Date().toISOString(),
              status: "queued",
            },
          ])
          return
        }
        throw new Error(data.error ?? "Failed to solve doubt")
      }

      const data = await res.json()
      setResponse(data)
    } catch (e) {
      console.error("Doubt solver error:", e)
      toast.error("Something went wrong while solving your doubt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const [showEmergency, setShowEmergency] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Doubt Solver
        </h1>
        <p className="text-muted-foreground mt-1">
          Type your doubt or upload an image. Get instant AI-powered explanations.
        </p>
      </div>

      <DoubtInput onSubmit={handleSubmit} isLoading={isLoading} />

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEmergency(!showEmergency)}
          className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
        >
          <Zap className="h-4 w-4" />
          {showEmergency ? "Hide" : "Emergency Room"}
        </Button>
      </div>

      {showEmergency && <EmergencyRoomPlaceholder />}

      {response && (
        <>
          <AiResponse response={response} />
          <Separator />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Explain Differently</h2>
            <p className="text-sm text-muted-foreground">
              Get the same concept explained in a different way.
            </p>
            <ExplainModes doubtText={lastDoubtText} />
          </div>
        </>
      )}

      <AsyncQueue items={queue} />
    </div>
  )
}
