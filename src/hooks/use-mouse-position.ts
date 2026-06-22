"use client"

import { RefObject, useCallback, useEffect, useRef, useState } from "react"

interface MousePosition {
  x: number
  y: number
  normalizedX: number
  normalizedY: number
  elementX: number
  elementY: number
}

export function useMousePosition<T extends HTMLElement = HTMLElement>(
  ref?: RefObject<T | null>
): MousePosition {
  const [pos, setPos] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    elementX: 0,
    elementY: 0,
  })

  const rafRef = useRef<number>(0)

  const handleMouse = useCallback(
    (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX
        const y = e.clientY
        const w = window.innerWidth
        const h = window.innerHeight

        let elementX = 0
        let elementY = 0

        if (ref?.current) {
          const rect = ref.current.getBoundingClientRect()
          elementX = x - rect.left
          elementY = y - rect.top
        }

        setPos({
          x,
          y,
          normalizedX: (x / w - 0.5) * 2,
          normalizedY: (y / h - 0.5) * 2,
          elementX,
          elementY,
        })
      })
    },
    [ref]
  )

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouse)
      cancelAnimationFrame(rafRef.current)
    }
  }, [handleMouse])

  return pos
}

export function useMagneticEffect<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  strength: number = 0.15
) {
  const { elementX, elementY } = useMousePosition(ref)

  const offsetX = (elementX - (ref.current?.offsetWidth ?? 0) / 2) * strength
  const offsetY = (elementY - (ref.current?.offsetHeight ?? 0) / 2) * strength

  return { offsetX, offsetY }
}
