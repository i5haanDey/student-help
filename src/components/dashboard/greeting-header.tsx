"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface GreetingHeaderProps {
  name: string
  avatarUrl?: string | null
  role: "student" | "teacher" | "admin"
  subtitle?: string
  badge?: string
  badgeColor?: string
}

const greetingText = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const roleColors: Record<string, { bg: string; badge: string }> = {
  student: {
    bg: "from-[hsl(var(--chart-1)_/_0.08)] via-[hsl(var(--chart-3)_/_0.04)] to-transparent",
    badge: "bg-[hsl(var(--chart-2)_/_0.15)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)_/_0.3)]",
  },
  teacher: {
    bg: "from-[hsl(var(--chart-1)_/_0.06)] via-[hsl(var(--chart-2)_/_0.03)] to-transparent",
    badge: "bg-[hsl(var(--chart-1)_/_0.15)] text-[hsl(var(--chart-1))] border-[hsl(var(--chart-1)_/_0.3)]",
  },
  admin: {
    bg: "from-[hsl(var(--chart-4)_/_0.08)] via-[hsl(var(--chart-5)_/_0.03)] to-transparent",
    badge: "bg-[hsl(var(--chart-4)_/_0.15)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)_/_0.3)]",
  },
}

export function GreetingHeader({ name, avatarUrl, role, subtitle, badge, badgeColor }: GreetingHeaderProps) {
  const initials = name.charAt(0).toUpperCase()
  const colors = roleColors[role]
  const greet = greetingText()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 md:p-8", colors.bg)}
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-background shadow-md ring-2 ring-primary/20">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {badge && (
            <Badge className={cn("absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]", badgeColor ?? colors.badge)}>
              {badge}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {greet}, {name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}
