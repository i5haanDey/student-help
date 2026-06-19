"use client"

import { useEffect, useState, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color?: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
  format?: "number" | "currency" | "percent"
  animate?: boolean
  subtitle?: string
  className?: string
}

const colorClasses: Record<string, { bg: string; iconBg: string; text: string; ring: string }> = {
  "chart-1": {
    bg: "from-[hsl(var(--chart-1)_/_0.12)] to-[hsl(var(--chart-1)_/_0.04)]",
    iconBg: "bg-[hsl(var(--chart-1)_/_0.15)] text-[hsl(var(--chart-1))]",
    text: "text-[hsl(var(--chart-1))]",
    ring: "ring-[hsl(var(--chart-1)_/_0.3)]",
  },
  "chart-2": {
    bg: "from-[hsl(var(--chart-2)_/_0.12)] to-[hsl(var(--chart-2)_/_0.04)]",
    iconBg: "bg-[hsl(var(--chart-2)_/_0.15)] text-[hsl(var(--chart-2))]",
    text: "text-[hsl(var(--chart-2))]",
    ring: "ring-[hsl(var(--chart-2)_/_0.3)]",
  },
  "chart-3": {
    bg: "from-[hsl(var(--chart-3)_/_0.12)] to-[hsl(var(--chart-3)_/_0.04)]",
    iconBg: "bg-[hsl(var(--chart-3)_/_0.15)] text-[hsl(var(--chart-3))]",
    text: "text-[hsl(var(--chart-3))]",
    ring: "ring-[hsl(var(--chart-3)_/_0.3)]",
  },
  "chart-4": {
    bg: "from-[hsl(var(--chart-4)_/_0.12)] to-[hsl(var(--chart-4)_/_0.04)]",
    iconBg: "bg-[hsl(var(--chart-4)_/_0.15)] text-[hsl(var(--chart-4))]",
    text: "text-[hsl(var(--chart-4))]",
    ring: "ring-[hsl(var(--chart-4)_/_0.3)]",
  },
  "chart-5": {
    bg: "from-[hsl(var(--chart-5)_/_0.12)] to-[hsl(var(--chart-5)_/_0.04)]",
    iconBg: "bg-[hsl(var(--chart-5)_/_0.15)] text-[hsl(var(--chart-5))]",
    text: "text-[hsl(var(--chart-5))]",
    ring: "ring-[hsl(var(--chart-5)_/_0.3)]",
  },
}

export function StatCard({ title, value, icon, color = "chart-1", format, animate = true, subtitle, className }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)
  const colors = colorClasses[color]

  useEffect(() => {
    if (!animate) return

    const numValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.-]/g, "")) : value
    if (Number.isNaN(numValue) || numValue === 0) return

    if (hasAnimated.current && displayValue === numValue) return
    hasAnimated.current = true

    const duration = 1000
    const steps = 30
    const increment = numValue / steps
    let current = 0
    let step = 0

    setDisplayValue(0)
    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), numValue)
      setDisplayValue(current)

      if (step >= steps) {
        setDisplayValue(numValue)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, animate])

  const formattedValue = (() => {
    if (!animate) return value
    if (format === "currency") return `₹${displayValue.toLocaleString()}`
    if (format === "percent") return `${displayValue}%`
    const num = typeof displayValue === "number" ? displayValue : Number.parseFloat(String(value))
    return Number.isNaN(num) ? String(value) : num.toLocaleString(undefined, { maximumFractionDigits: 1 })
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-shadow hover:shadow-lg",
        colors.bg,
        "border-transparent",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold tracking-tight", colors.text)}>{formattedValue}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colors.iconBg)}>
          {icon}
        </div>
      </div>
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.04]" />
    </motion.div>
  )
}
