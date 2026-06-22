"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ease } from "@/lib/animations"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageVariants: Record<string, any> = {
  initial: {
    opacity: 0,
    y: 6,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.2,
      ease,
    },
  },
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}
