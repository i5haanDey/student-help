"use client"

import { Component, type ReactNode } from "react"
import { Tldraw } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-red-50 p-4">
          <div className="text-red-600 text-sm font-mono whitespace-pre-wrap max-w-full overflow-auto">
            {this.state.error.stack || this.state.error.message}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function SessionWhiteboard(_props: { sessionId: string }) {
  return (
    <div className="h-full w-full relative" style={{ isolation: "isolate" }}>
      <ErrorBoundary>
        <Tldraw />
      </ErrorBoundary>
    </div>
  )
}
