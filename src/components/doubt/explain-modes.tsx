"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Lightbulb, Image, GitBranch, ListChecks, Target } from "lucide-react"

const modes = [
  { id: "simple", label: "Simple", icon: Lightbulb, description: "Plain and simple language" },
  { id: "visual", label: "Visual", icon: Image, description: "Visual description" },
  { id: "analogy", label: "Analogy", icon: GitBranch, description: "Real-world analogy" },
  { id: "step_by_step", label: "Step-by-Step", icon: ListChecks, description: "Detailed steps" },
  { id: "exam_oriented", label: "Exam-Oriented", icon: Target, description: "Exam-focused tips" },
]

interface ExplainModesProps {
  doubtText?: string
  onExplain?: (mode: string, content: string) => void
}

export function ExplainModes({ doubtText, onExplain }: ExplainModesProps) {
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleModeClick(modeId: string) {
    if (activeMode === modeId) {
      setActiveMode(null)
      setContent(null)
      return
    }

    setActiveMode(modeId)
    setIsLoading(true)
    setContent(null)

    try {
      const res = await fetch("/api/doubt/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: modeId, doubtText: doubtText ?? "" }),
      })
      if (!res.ok) throw new Error("Failed to explain")
      const result = await res.json()
      setContent(result.content)
      onExplain?.(modeId, result.content)
    } catch {
      setContent("Unable to generate explanation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isActive = activeMode === mode.id
          return (
            <Button
              key={mode.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeClick(mode.id)}
              disabled={isLoading}
              className="flex items-center gap-1.5"
            >
              <Icon className="h-4 w-4" />
              {mode.label}
            </Button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </motion.div>
        )}
        {content && !isLoading && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {modes.find((m) => m.id === activeMode)?.label} Explanation
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
