"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { PatternBg } from "@/components/ui/pattern-bg"

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative overflow-hidden text-center space-y-4 max-w-md rounded-xl border bg-card p-8">
        <PatternBg variant="crosshatch" className="opacity-30" />
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto relative" />
        <h1 className="text-2xl font-bold relative">Something went wrong</h1>
        <p className="text-muted-foreground text-sm relative">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="relative">Try Again</Button>
      </div>
    </div>
  )
}
