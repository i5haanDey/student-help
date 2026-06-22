"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DoubtInput } from "@/components/doubt/doubt-input"
import { AiResponse } from "@/components/doubt/ai-response"
import { ExplainModes } from "@/components/doubt/explain-modes"
import { AsyncQueue } from "@/components/doubt/async-queue"
import { EmergencyRoomPlaceholder } from "@/components/dummy/emergency-room-placeholder"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Lightbulb, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { staggerContainer, fadeUp } from "@/lib/animations"
import { PatternBg } from "@/components/ui/pattern-bg"
import type { AiResponse as AiResponseType } from "@/types"

interface QueueItem {
  id: string
  question: string
  submittedAt: string
  status: "queued" | "processing" | "resolved"
}

const suggestions = [
  "What is the Pythagorean theorem?",
  "Explain photosynthesis",
  "How does gravity work?",
  "What is a derivative?",
]

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

  function handleSuggestionClick(suggestion: string) {
    handleSubmit(suggestion, null)
  }

  const [showEmergency, setShowEmergency] = useState(false)

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          AI Doubt Solver
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-12">
          Type your doubt or upload an image. Get instant AI-powered explanations.
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <DoubtInput onSubmit={handleSubmit} isLoading={isLoading} />
      </motion.div>

      {!response && !isLoading && queue.length === 0 && (
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Try asking something like:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSuggestionClick(s)}
                className="flex items-center gap-1 rounded-lg border border-border/50 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors duration-200"
              >
                {s} <ChevronRight className="h-3 w-3" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEmergency(!showEmergency)}
          className="gap-2 text-amber-600 border-amber-300/50 hover:bg-amber-50 dark:border-amber-700/50 dark:text-amber-400 dark:hover:bg-amber-950/30 transition-all duration-200"
        >
          <Zap className="h-4 w-4" />
          {showEmergency ? "Hide" : "Emergency Room"}
        </Button>
      </motion.div>

      {showEmergency && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <EmergencyRoomPlaceholder />
        </motion.div>
      )}

      {response && (
        <>
          <AiResponse response={response} />
          <motion.div variants={fadeUp}>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Explain Differently
              </h2>
              <p className="text-xs text-muted-foreground ml-6">
                Get the same concept explained in a different way.
              </p>
              <ExplainModes doubtText={lastDoubtText} />
            </div>
          </motion.div>
        </>
      )}

      <AsyncQueue items={queue} />
    </motion.div>
  )
}
