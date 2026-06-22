"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function ScrollProgressBar() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
  })

  if (reduced) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-primary via-primary/80 to-secondary"
      style={{ scaleX }}
    />
  )
}
