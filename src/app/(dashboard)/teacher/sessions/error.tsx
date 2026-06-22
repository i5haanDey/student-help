"use client"

import { Button } from "@/components/ui/button"
import { Video, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TeacherSessionsError({
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
          <Video className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Could not load your sessions</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "There was a problem fetching your sessions. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Retry</Button>
          <Button variant="outline" onClick={() => router.push("/teacher")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
