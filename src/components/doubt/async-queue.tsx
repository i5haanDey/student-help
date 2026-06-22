"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { PatternBg } from "@/components/ui/pattern-bg"

interface QueueItem {
  id: string
  question: string
  submittedAt: string
  status: "queued" | "processing" | "resolved"
  answer?: string
}

interface AsyncQueueProps {
  items: QueueItem[]
  onRemove?: (id: string) => void
}

export function AsyncQueue({ items, onRemove }: AsyncQueueProps) {
  const [polledStatuses, setPolledStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    if (items.length === 0) return

    const pending = items.filter((i) => i.status !== "resolved")
    if (pending.length === 0) return

    const interval = setInterval(async () => {
      for (const item of pending) {
        try {
          const res = await fetch(`/api/doubt/status?id=${item.id}`)
          const data = await res.json()
          if (data.status && data.status !== item.status) {
            setPolledStatuses((prev) => ({ ...prev, [item.id]: data.status }))
            if (data.status === "resolved") {
              toast.success("Your doubt has been resolved!")
            }
          }
        } catch {
          // silent - poll will retry
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [items])

  const displayedItems = items.map((item) => ({
    ...item,
    status: (polledStatuses[item.id] as QueueItem["status"]) ?? item.status,
  }))

  if (items.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <PatternBg variant="dots" className="opacity-25" />
      <CardHeader className="relative">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Async Doubt Queue
        </CardTitle>
        <CardDescription>
          Your doubts are being processed. Results will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        <AnimatePresence>
          {displayedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-3 rounded-lg border"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submitted {new Date(item.submittedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.status === "resolved" ? "default" :
                      item.status === "processing" ? "secondary" :
                      "outline"
                    }
                    className="shrink-0"
                  >
                    {item.status === "processing" && (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    )}
                    {item.status === "queued" && "Queued"}
                    {item.status === "processing" && "Processing"}
                    {item.status === "resolved" && "Resolved"}
                  </Badge>
                  {onRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {item.status === "resolved" && item.answer && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-sm text-muted-foreground mt-2 pt-2 border-t"
                >
                  {item.answer}
                </motion.p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
