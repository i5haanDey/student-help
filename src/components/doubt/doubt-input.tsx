"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, X, Loader2, Send } from "lucide-react"
import Image from "next/image"

interface DoubtInputProps {
  onSubmit: (text: string, file: File | null) => Promise<void>
  isLoading: boolean
}

export function DoubtInput({ onSubmit, isLoading }: DoubtInputProps) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (!f || !f.type.startsWith("image/")) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const f = item.getAsFile()
        if (f) {
          setFile(f)
          setPreview(URL.createObjectURL(f))
        }
      }
    }
  }

  function clearFile() {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() && !file) return
    await onSubmit(text, file)
    setText("")
    clearFile()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative transition-colors ${isDragging ? "ring-2 ring-primary rounded-lg" : ""}`}
      >
        <Textarea
          placeholder="Type your doubt here... (e.g., 'What is the derivative of x²?')"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          className="min-h-[120px] resize-none pr-12 text-base"
          disabled={isLoading}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary/5 border-2 border-dashed border-primary pointer-events-none">
            <p className="text-sm font-medium text-primary">Drop image here</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="relative inline-flex rounded-lg border overflow-hidden">
          <Image
            src={preview}
            alt="Upload preview"
            width={200}
            height={200}
            className="object-cover max-h-[200px]"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={clearFile}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={(!text.trim() && !file) || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Solving...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Solve Doubt
          </>
        )}
      </Button>
    </form>
  )
}
