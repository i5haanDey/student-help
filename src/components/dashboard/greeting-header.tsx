"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface GreetingHeaderProps {
  name: string
  avatarUrl?: string | null
  role: "student" | "teacher" | "admin"
  subtitle?: string
  badgeText?: string
}

const greetingText = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function GreetingHeader({ name, avatarUrl, role, subtitle, badgeText }: GreetingHeaderProps) {
  const initials = name.charAt(0).toUpperCase()
  const greet = greetingText()

  return (
    <div className="flex items-center gap-4 px-1">
      <Avatar className="h-12 w-12 border">
        <AvatarImage src={avatarUrl ?? undefined} alt={name} />
        <AvatarFallback className="bg-muted text-sm font-medium">{initials}</AvatarFallback>
      </Avatar>
      <div className="space-y-0.5">
        <h1 className="text-xl font-semibold tracking-tight">
          {greet}, {name.split(" ")[0]}
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          {badgeText && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {badgeText}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
