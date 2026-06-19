"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Share2, Users } from "lucide-react"
import { toast } from "sonner"

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
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <MessageSquare className="h-24 w-24 text-primary/30" />
            <Users className="h-12 w-12 text-primary absolute -bottom-2 -right-2" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-lg text-muted-foreground">
            Coming when we reach <span className="font-semibold text-foreground">500 active students</span>
          </p>
          <p className="text-sm text-muted-foreground">
            The forum is where students help each other and learn from verified teachers.
            We&apos;ll unlock it as soon as our community is big enough to make it useful.
          </p>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xl">42 students learning</span>
            </CardTitle>
            <CardDescription>
              Share with friends to unlock the forum faster!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleShare} className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              Share with Friends
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
