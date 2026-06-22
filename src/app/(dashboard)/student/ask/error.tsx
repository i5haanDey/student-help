"use client"

import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AskError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex-1 flex items-center justify-center py-20 p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <Brain className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Doubt solver unavailable</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "The AI doubt solver is temporarily unavailable. Please try again shortly."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => router.push("/student")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
