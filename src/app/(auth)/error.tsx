"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Authentication Error</h2>
        <p className="text-muted-foreground text-sm">Please try signing in again.</p>
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  )
}
