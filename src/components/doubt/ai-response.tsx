"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, ShieldQuestion, BookOpen } from "lucide-react"
import type { AiResponse } from "@/types"

interface AiResponseProps {
  response: AiResponse
}

const confidenceConfig = {
  high: { icon: ShieldCheck, variant: "success" as const, label: "High Confidence" },
  medium: { icon: ShieldAlert, variant: "warning" as const, label: "Medium Confidence" },
  low: { icon: ShieldQuestion, variant: "destructive" as const, label: "Low Confidence" },
}

export function AiResponse({ response }: AiResponseProps) {
  const config = confidenceConfig[response.confidenceLevel]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{response.subjectDetected}</span>
            </div>
            <Badge variant={config.variant} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{response.text}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
