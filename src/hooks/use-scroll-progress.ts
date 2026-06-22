"use client"

import { useEffect, useState } from "react"

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollY(scrolled)
      setProgress(max > 0 ? Math.min(scrolled / max, 1) : 0)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return { progress, scrollY }
}

export function useInView(
  ref: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit & { margin?: string }
) {
  const [inView, setInView] = useState(false)
  const [ratio, setRatio] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { margin, ...rest } = options ?? {}

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        setRatio(entry.intersectionRatio)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: margin, ...rest }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, options])

  return { inView, ratio }
}
