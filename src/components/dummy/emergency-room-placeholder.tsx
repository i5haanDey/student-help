"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertTriangle, Sparkles, Users } from "lucide-react"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"

export function EmergencyRoomPlaceholder() {
  const router = useRouter()

  return (
    <Card className="border-amber-200/60 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/10 overflow-hidden">
      <PatternBg variant="crosshatch" className="opacity-30 text-amber-800/20 dark:text-amber-200/10" />
      <CornerArc className="top-0 right-0" size={100} />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          Emergency Learning Rooms
        </CardTitle>
        <CardDescription className="text-amber-600/80 dark:text-amber-300/80">
          For urgent doubts before exams. Coming in Phase 2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
          For now, use the AI Doubt Solver for instant answers or book a live session with an available teacher.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-amber-300/50 text-amber-700 hover:bg-amber-100/50 dark:border-amber-700/50 dark:text-amber-300"
            onClick={() => {
              const input = document.querySelector<HTMLTextAreaElement>("textarea[placeholder*='doubt']")
              if (input) {
                input.focus()
                input.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            <Sparkles className="h-4 w-4" />
            Try AI Solver
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => router.push("/student/teachers")}
          >
            <Users className="h-4 w-4" />
            Book a Teacher
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
