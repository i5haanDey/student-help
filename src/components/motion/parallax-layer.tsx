"use client"

import { type ReactNode, useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface ParallaxLayerProps {
  children: ReactNode
  speed?: number
  className?: string
  as?: "div" | "section"
}

export function ParallaxLayer({
  children,
  speed = 0.2,
  className,
  as = "div",
}: ParallaxLayerProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  if (reduced) {
    const Component = as
    return <Component className={className}>{children}</Component>
  }

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [speed * 60, speed * -60])

  const MotionComponent = as === "section" ? motion.section : motion.div

  return (
    <MotionComponent ref={ref} style={{ y }} className={className}>
      {children}
    </MotionComponent>
  )
}

interface ParallaxGroupProps {
  children: ReactNode
  className?: string
}

export function ParallaxGroup({ children, className }: ParallaxGroupProps) {
  return <div className={className}>{children}</div>
}
