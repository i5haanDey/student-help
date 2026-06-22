"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { PatternBg } from "@/components/ui/pattern-bg"
import { useRouter } from "next/navigation"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex-1 flex items-center justify-center py-20 p-4">
      <div className="relative overflow-hidden text-center space-y-4 max-w-md rounded-xl border bg-card p-8">
        <PatternBg variant="crosshatch" className="opacity-30" />
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto relative" />
        <h2 className="text-xl font-semibold relative">Something went wrong</h2>
        <p className="text-muted-foreground text-sm relative">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-3 justify-center relative">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
