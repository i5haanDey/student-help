"use client"

import { useCallback, useRef, useEffect } from "react"
import { Tldraw, getSnapshot, loadSnapshot, type TLStore } from "@tldraw/tldraw"
import type { Editor } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

declare global {
  interface Window {
    __saveWhiteboardSnapshot?: () => Promise<unknown>
  }
}

interface SessionWhiteboardProps {
  sessionId: string
}

export function SessionWhiteboard({ sessionId }: SessionWhiteboardProps) {
  const editorRef = useRef<Editor | null>(null)

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor

    fetch(`/api/sessions/${sessionId}/whiteboard`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.snapshot) {
          loadSnapshot(editor.store as TLStore, data.snapshot)
        }
      })
      .catch(() => {})
  }, [sessionId])

  async function saveSnapshot() {
    const editor = editorRef.current
    if (!editor) return null

    const snapshot = getSnapshot(editor.store as TLStore)
    return snapshot
  }

  useEffect(() => {
    window.__saveWhiteboardSnapshot = saveSnapshot
    return () => { delete window.__saveWhiteboardSnapshot }
  })

  async function handleExport() {
    const editor = editorRef.current
    if (!editor) return

    try {
      const shapeIds = Array.from(editor.getCurrentPageShapeIds())
      const result = await editor.toImage(shapeIds, { format: "png", background: true })
      if (!result) return
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `whiteboard-${sessionId.slice(0, 8)}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // export not available
    }
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-2 right-2 z-10">
        <Button variant="outline" size="icon" onClick={handleExport} title="Export as PNG">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-full w-full [&_.tl-container]:rounded-none">
        <Tldraw onMount={handleMount} />
      </div>
    </div>
  )
}
