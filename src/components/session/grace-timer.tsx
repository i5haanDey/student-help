"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface GraceTimerProps {
  remainingSeconds: number
  onExpired: () => void
  label?: string
}

export function GraceTimer({ remainingSeconds, onExpired, label = "Grace period" }: GraceTimerProps) {
  const [seconds, setSeconds] = useState(remainingSeconds)

  useEffect(() => {
    setSeconds(remainingSeconds)
  }, [remainingSeconds])

  useEffect(() => {
    if (seconds <= 0) return
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds, onExpired])

  if (seconds <= 0) return null

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isUrgent = seconds < 300

  return (
    <div className={`flex items-center gap-2 text-sm font-mono tabular-nums ${isUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
      <Clock className="h-4 w-4" />
      <span>
        {label}: {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  )
}
