"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, ShieldQuestion, BookOpen, Sparkles } from "lucide-react"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"
import type { AiResponse } from "@/types"

interface AiResponseProps {
  response: AiResponse
}

const confidenceConfig = {
  high: { icon: ShieldCheck, variant: "success" as const, label: "High Confidence", color: "text-emerald-600 dark:text-emerald-400" },
  medium: { icon: ShieldAlert, variant: "warning" as const, label: "Medium Confidence", color: "text-amber-600 dark:text-amber-400" },
  low: { icon: ShieldQuestion, variant: "destructive" as const, label: "Low Confidence", color: "text-red-600 dark:text-red-400" },
}

export function AiResponse({ response }: AiResponseProps) {
  const config = confidenceConfig[response.confidenceLevel]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <PatternBg variant="crosshatch" className="opacity-25" />
        <CornerArc className="top-0 right-0" size={100} />
        <CardContent className="pt-5 space-y-4 relative">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{response.subjectDetected}</span>
              <span className="text-muted-foreground/40 mx-1">|</span>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary font-medium">AI Generated</span>
            </div>
            <Badge variant={config.variant} className={`flex items-center gap-1 text-[10px] ${config.color}`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>

          <div className="rounded-xl bg-muted/30 p-4 border border-border/30">
            <p className="text-sm whitespace-pre-wrap leading-[1.75]">{response.text}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
