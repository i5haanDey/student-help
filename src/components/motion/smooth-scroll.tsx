"use client"

import { useEffect, useState, type ReactNode } from "react"
import Lenis from "lenis"

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [isTouch] = useState(() => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0))

  useEffect(() => {
    if (isTouch) return

    const lenis = new Lenis({
      lerp: 0.05,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [isTouch])

  return <>{children}</>
}
