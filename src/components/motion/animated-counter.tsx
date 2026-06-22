"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, animate, type UseInViewOptions } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface AnimatedCounterProps {
  from?: number
  to: number
  duration?: number
  delay?: number
  suffix?: string
  prefix?: string
  className?: string
  format?: boolean
  decimals?: number
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 1.5,
  delay = 0,
  suffix = "",
  prefix = "",
  className,
  format: shouldFormat = false,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as React.RefObject<HTMLSpanElement>, {
    once: true,
  } as UseInViewOptions)
  const reduced = useReducedMotion()
  const [displayed, setDisplayed] = useState(reduced ? to : from)

  useEffect(() => {
    if (!inView || reduced) {
      if (reduced) setDisplayed(to)
      return
    }

    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (value) => setDisplayed(value),
    })

    return () => controls.stop()
  }, [inView, from, to, duration, delay, reduced])

  const formatted = shouldFormat
    ? displayed.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : displayed.toFixed(decimals)

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {prefix}
      {formatted}
      {suffix}
    </motion.span>
  )
}
