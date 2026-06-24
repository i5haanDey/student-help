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
        <div
          className="h-full w-full overflow-auto bg-red-50 p-4"
          style={{ maxHeight: "100%" }}
        >
          <h2 className="text-red-700 font-bold text-sm mb-2">
            Whiteboard Error
          </h2>
          <pre className="text-red-600 text-xs font-mono whitespace-pre-wrap break-all">
            {this.state.error.stack || this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export function SessionWhiteboard({ sessionId }: { sessionId: string }) {
  return (
    <div className="relative h-full w-full">
      <ErrorBoundary>
        <Tldraw persistenceKey={sessionId} colorScheme="light" />
      </ErrorBoundary>
    </div>
  )
}
