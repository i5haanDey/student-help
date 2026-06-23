"use client"

import { Tldraw } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"

export function SessionWhiteboard(_props: { sessionId: string }) {
  return (
    <div className="h-full w-full">
      <Tldraw />
    </div>
  )
}
