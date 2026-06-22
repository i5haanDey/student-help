"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { PatternBg } from "@/components/ui/pattern-bg"

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="relative overflow-hidden text-center space-y-4 rounded-xl border bg-card p-8 max-w-sm">
        <PatternBg variant="dots" className="opacity-30" />
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto relative" />
        <h2 className="text-xl font-semibold relative">Authentication Error</h2>
        <p className="text-muted-foreground text-sm relative">Please try signing in again.</p>
        <Button onClick={reset} className="relative">Retry</Button>
      </div>
    </div>
  )
}
