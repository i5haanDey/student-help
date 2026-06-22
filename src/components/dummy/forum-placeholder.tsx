"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Share2, Users } from "lucide-react"
import { toast } from "sonner"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"

export function ForumPlaceholder() {
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Student Help",
        text: "Join me on Student Help — the best AI-powered tutoring platform!",
        url: "https://studenthelp.app",
      })
    } else {
      navigator.clipboard.writeText("https://studenthelp.app")
      toast.success("Link copied to clipboard!")
    }
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="max-w-lg mx-auto text-center space-y-8 relative">
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <MessageSquare className="h-12 w-12 text-primary/50" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-base text-muted-foreground">
            Coming when we reach <span className="font-semibold text-foreground">500 active students</span>
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            The forum is where students help each other and learn from verified teachers.
            We&apos;ll unlock it as soon as our community is big enough to make it useful.
          </p>
        </div>

        <Card className="bg-card/50 border-border/60 overflow-hidden">
          <PatternBg variant="dots" className="opacity-30" />
          <CornerArc className="top-0 right-0" size={100} />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xl">42 students learning</span>
            </CardTitle>
            <CardDescription>
              Share with friends to unlock the forum faster!
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button onClick={handleShare} className="w-full gap-2 shadow-lg shadow-primary/20">
              <Share2 className="h-4 w-4" />
              Share with Friends
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
