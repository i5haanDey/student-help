"use client"

import { Component, type ReactNode } from "react"
import { Tldraw } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null; eventErrors: string[] }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null, eventErrors: [] }
  }
  static getDerivedStateFromError(error: Error) {
    return { error, eventErrors: [] }
  }
  componentDidMount() {
    const handler = (e: ErrorEvent) => {
      this.setState((s) => ({
        eventErrors: [...s.eventErrors, e.message].slice(-5),
      }))
    }
    window.addEventListener("error", handler)
    const r = (e: PromiseRejectionEvent) => {
      this.setState((s) => ({
        eventErrors: [...s.eventErrors, String(e.reason)].slice(-5),
      }))
    }
    window.addEventListener("unhandledrejection", r)
  }
  render() {
    if (this.state.error || this.state.eventErrors.length > 0) {
      return (
        <div
          className="h-full w-full overflow-auto bg-red-50 p-4"
          style={{ maxHeight: "100%" }}
        >
          {this.state.error && (
            <>
              <h2 className="text-red-700 font-bold text-sm mb-2">
                React Error Boundary
              </h2>
              <pre className="text-red-600 text-xs font-mono whitespace-pre-wrap break-all">
                {this.state.error.stack || this.state.error.message}
              </pre>
            </>
          )}
          {this.state.eventErrors.length > 0 && (
            <>
              <h2 className="text-red-700 font-bold text-sm mt-4 mb-2">
                Uncaught Errors
              </h2>
              {this.state.eventErrors.map((e, i) => (
                <pre
                  key={i}
                  className="text-red-600 text-xs font-mono whitespace-pre-wrap break-all mb-1"
                >
                  {e}
                </pre>
              ))}
            </>
          )}
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
