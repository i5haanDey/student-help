"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { fadeUp, ease } from "@/lib/animations"
import { PatternBg, GlowSpot } from "@/components/ui/pattern-bg"
import { ScrollReveal, RevealItem } from "@/components/motion/scroll-reveal"
import { staggerContainer } from "@/lib/animations"

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

const roleGradients: Record<string, string> = {
  student: "from-primary/6 via-primary/3 to-transparent",
  teacher: "from-secondary/6 via-secondary/3 to-transparent",
  admin: "from-destructive/6 via-destructive/3 to-transparent",
}

const roleGlowColors: Record<string, string> = {
  student: "oklch(0.52 0.24 275)",
  teacher: "oklch(0.68 0.18 45)",
  admin: "oklch(0.58 0.24 25)",
}

export function GreetingHeader({ name, avatarUrl, role, subtitle, badgeText }: GreetingHeaderProps) {
  const initials = name.charAt(0).toUpperCase()
  const greet = greetingText()

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <PatternBg variant="grid" className="opacity-25" />
      <GlowSpot
        className="-top-20 -right-20 h-48 w-48"
        color={roleGlowColors[role]}
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${roleGradients[role]}`} />
      <div className="flex items-center gap-4 md:gap-5 relative p-5 md:p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease, delay: 0.1 }}
        >
          <Avatar className="h-14 w-14 md:h-16 md:w-16 ring-2 ring-border/50 ring-offset-2 ring-offset-background shrink-0">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-lg font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="space-y-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.2 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              {greet}, <span className="text-gradient">{name.split(" ")[0]}</span>
            </h1>
            {badgeText && (
              <Badge variant={badgeText === "Approved" ? "success" : "warning"} className="text-[10px] px-2 py-0.5">
                {badgeText}
              </Badge>
            )}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.3 }}
            className="text-sm text-muted-foreground/80"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
