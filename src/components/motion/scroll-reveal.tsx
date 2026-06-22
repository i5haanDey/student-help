"use client"

import { motion, type Variants, type HTMLMotionProps } from "framer-motion"
import { type ReactNode, useRef, Children, isValidElement, cloneElement } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { staggerContainer, fadeUp, ease } from "@/lib/animations"
import { useInView } from "@/hooks/use-scroll-progress"

interface ScrollRevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode
  variants?: Variants
  once?: boolean
  margin?: string
  as?: "div" | "section" | "article"
}

export function ScrollReveal({
  children,
  variants = staggerContainer,
  once = true,
  margin = "-80px",
  as = "div",
  ...props
}: ScrollRevealProps) {
  const reduced = useReducedMotion()
  const Component = motion[as as keyof typeof motion] as typeof motion.div

  return (
    <Component
      initial={reduced ? "visible" : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={{ once, margin }}
      variants={reduced ? undefined : variants}
      {...props}
    >
      {children}
    </Component>
  )
}

interface RevealItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode
  variants?: Variants
}

export function RevealItem({ children, variants = fadeUp, ...props }: RevealItemProps) {
  return (
    <motion.div variants={variants} {...props}>
      {children}
    </motion.div>
  )
}

interface ProgressiveRevealProps {
  children: ReactNode
  as?: "div" | "section" | "article"
  staggerDelay?: number
  baseDelay?: number
  className?: string
}

export function ProgressiveReveal({
  children,
  as = "div",
  staggerDelay = 0.08,
  baseDelay = 0.1,
  className,
}: ProgressiveRevealProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { inView } = useInView(ref)

  const items = Children.toArray(children)

  const Component = as === "section" ? "section" : "div"

  return (
    <Component ref={ref} className={className}>
      {reduced
        ? children
        : items.map((child, i) => {
            if (!isValidElement(child)) return child
            const originalProps = child.props as Record<string, unknown>
            const originalStyle = originalProps.style as Record<string, unknown> | undefined
            return cloneElement(child, {
              style: {
                ...originalStyle,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ${ease.join(", ")}, transform 0.5s ${ease.join(", ")}`,
                transitionDelay: `${baseDelay + i * staggerDelay}s`,
              },
            } as React.HTMLAttributes<HTMLElement>)
          })}
    </Component>
  )
}
