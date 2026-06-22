"use client"

import { type ReactNode, Children, isValidElement } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { itemFadeUp } from "@/lib/animations"

interface AssemblySequenceProps {
  children: ReactNode
  className?: string
  baseDelay?: number
  staggerDelay?: number
}

export function AssemblySequence({
  children,
  className,
  baseDelay = 0.08,
  staggerDelay = 0.06,
}: AssemblySequenceProps) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: baseDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AssemblyItemProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AssemblyItem({ children, className }: AssemblyItemProps) {
  return (
    <motion.div variants={itemFadeUp} className={className}>
      {children}
    </motion.div>
  )
}
