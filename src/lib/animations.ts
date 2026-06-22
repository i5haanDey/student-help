import { type Variants, type Transition, type TargetAndTransition } from "framer-motion"

export const ease = [0.25, 0.1, 0.25, 1] as const
export const easeOut = [0.16, 1, 0.3, 1] as const
export const easeIn = [0.4, 0, 0.6, 1] as const

export const spring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
} as const

export const springGentle = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
} as const

export const springSnappy = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
} as const

export const springBouncy = {
  type: "spring" as const,
  stiffness: 300,
  damping: 15,
} as const

export const defaultTransition: Transition = {
  duration: 0.5,
  ease,
}

export const fastTransition: Transition = {
  duration: 0.25,
  ease,
}

export const slowTransition: Transition = {
  duration: 0.7,
  ease,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

export const fadeUpLarge: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease },
  },
}

export const scaleInSpring: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springGentle,
  },
}

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease },
  },
}

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease },
  },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.06,
    },
  },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
}

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

export const statCardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease,
    },
  }),
}

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease,
    },
  }),
}

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease },
  },
}

export const expandCollapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease },
  },
}

export const cardHover: TargetAndTransition = {
  y: -2,
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
}

export const cardTap: TargetAndTransition = {
  scale: 0.98,
}

export const buttonTap: TargetAndTransition = {
  scale: 0.97,
}

export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
}

export const navItemVariants: Variants = {
  inactive: { color: "var(--muted-foreground)" },
  active: { color: "var(--primary)" },
}

export const loadingDots = {
  animate: {
    transition: { staggerChildren: 0.12 },
  },
}

export const loadingDot = {
  initial: { opacity: 0.3, y: 0 },
  animate: {
    opacity: [0.3, 1, 0.3],
    y: [0, -4, 0],
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
  },
}

export const drawChart: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.2, delay: i * 0.15, ease: easeOut },
      opacity: { duration: 0.3, delay: i * 0.15 },
    },
  }),
}

export const barGrow: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    scaleY: 1,
    opacity: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.6,
      ease: easeOut,
    },
  }),
}

export const counter: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
}

export const cardStack: Variants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 20,
    scale: 1 - i * 0.01,
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: easeOut,
    },
  }),
}

export const revealLeft: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.6, ease: easeOut },
  },
}

export const revealRight: Variants = {
  hidden: { clipPath: "inset(0 0% 0 100%)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.6, ease: easeOut },
  },
}

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -5, scale: 0.95 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
}

export const sequence = (
  total: number,
  baseDelay: number = 0.06,
  staggerDelay: number = 0.04
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: baseDelay,
    },
  },
})

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
}
