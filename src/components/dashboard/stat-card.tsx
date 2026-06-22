"use client"

import { motion } from "framer-motion"
import { statCardVariants } from "@/lib/animations"
import { PatternBg } from "@/components/ui/pattern-bg"
import { AnimatedCounter } from "@/components/motion/animated-counter"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  subtext?: string
  index?: number
  pattern?: "dots" | "grid" | "crosshatch" | "arch" | "none"
  trend?: { value: number; positive: boolean }
}

export function StatCard({ label, value, icon, subtext, index = 0, pattern = "dots", trend }: StatCardProps) {
  const numericValue = typeof value === "number" ? value : parseInt(String(value).replace(/[^0-9.]/g, ""))
  const isNumeric = typeof value === "number" || /^[\d,.]+$/.test(String(value).replace(/[%₹$]/g, ""))
  const prefix = String(value).startsWith("₹") ? "₹" : ""
  const suffix = String(value).endsWith("%") ? "%" : ""

  return (
    <motion.div
      custom={index}
      variants={statCardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } }}
      className="group relative overflow-hidden rounded-xl border bg-card shadow-card transition-shadow duration-300 hover:shadow-elevated"
    >
      <PatternBg variant={pattern} className="opacity-30" />
      <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-primary/[0.03] to-transparent transition-all duration-500 group-hover:from-primary/[0.08]" />
      <div className="flex items-start justify-between gap-3 relative p-5">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight">
            {isNumeric && !isNaN(numericValue) ? (
              <AnimatedCounter
                from={0}
                to={numericValue}
                duration={1.2}
                delay={index * 0.06}
                prefix={prefix}
                suffix={suffix}
                format
              />
            ) : (
              value
            )}
          </p>
          {(subtext || trend) && (
            <div className="flex items-center gap-2">
              {subtext && (
                <p className="text-xs text-muted-foreground/70">{subtext}</p>
              )}
              {trend && (
                <span className={`text-xs font-medium ${trend.positive ? "text-emerald-500" : "text-red-500"}`}>
                  {trend.positive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/15 group-hover:to-primary/8 group-hover:ring-primary/15">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
