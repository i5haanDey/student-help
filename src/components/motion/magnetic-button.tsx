"use client"

import { useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import { useMagneticEffect } from "@/hooks/use-mouse-position"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { buttonTap } from "@/lib/animations"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
}

export function MagneticButton({
  children,
  className,
  strength = 0.08,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { offsetX, offsetY } = useMagneticEffect(ref, strength)

  if (reduced) {
    return (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    )
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement | null>}
      className={className}
      onClick={onClick}
      whileHover={{ x: offsetX, y: offsetY }}
      whileTap={buttonTap}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  )
}

interface MagneticAreaProps {
  children: ReactNode
  className?: string
}

export function MagneticArea({ children, className }: MagneticAreaProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { offsetX, offsetY } = useMagneticEffect(ref, 0.06)

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      whileHover={{ x: offsetX, y: offsetY }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {children}
    </motion.div>
  )
}
