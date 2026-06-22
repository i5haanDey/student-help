"use client"

import { cn } from "@/lib/utils"

interface PatternBgProps {
  variant?: "dots" | "grid" | "crosshatch" | "waves" | "arch" | "none"
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "20px 20px",
  md: "32px 32px",
  lg: "48px 48px",
}

const patterns = {
  dots: (
    <pattern id="p-dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.03" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" opacity="0.02" />
    </pattern>
  ),
  grid: (
    <pattern id="p-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.025" />
    </pattern>
  ),
  crosshatch: (
    <pattern id="p-cross" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M0 12L12 0M-3 3L3 -3M9 15L15 9" stroke="currentColor" strokeWidth="0.5" opacity="0.02" />
    </pattern>
  ),
  waves: (
    <pattern id="p-waves" width="40" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 10 Q10 0 20 10 Q30 20 40 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.025" />
    </pattern>
  ),
  arch: (
    <pattern id="p-arch" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 60 Q60 20 20 20 Q-20 20 -20 60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.02" />
    </pattern>
  ),
}

export function PatternBg({ variant = "dots", className, size = "md" }: PatternBgProps) {
  if (variant === "none") return null
  const patternEl = patterns[variant]
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        style={{ backgroundSize: sizeMap[size] }}
      >
        <defs>{patternEl}</defs>
        <rect width="100%" height="100%" fill={`url(#p-${variant})`} />
      </svg>
    </div>
  )
}

export function CornerArc({ className, size = 120 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn("pointer-events-none absolute", className)}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <path
          d={`M${size} ${size}L${size} ${size * 0.4}Q${size} 0 ${size * 0.4} 0L0 0`}
          fill="currentColor"
          opacity="0.02"
        />
        <path
          d={`M${size} ${size}L${size} ${size * 0.6}Q${size} ${size * 0.15} ${size * 0.6} ${size * 0.15}L0 ${size * 0.15}`}
          fill="currentColor"
          opacity="0.012"
        />
      </svg>
    </div>
  )
}

export function SideSweep({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div className="absolute -left-20 top-0 h-full w-48 bg-gradient-to-r from-current/4 via-current/1.5 to-transparent" />
    </div>
  )
}

export function GlowSpot({ className, color }: { className?: string; color?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute", className)}
      aria-hidden="true"
    >
      <div
        className="h-full w-full rounded-full blur-3xl"
        style={{ background: color ?? "currentcolor", opacity: 0.04 }}
      />
    </div>
  )
}
