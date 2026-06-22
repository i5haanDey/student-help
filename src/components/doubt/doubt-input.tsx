"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, X, Loader2, Send, Mic } from "lucide-react"
import Image from "next/image"
import { PatternBg } from "@/components/ui/pattern-bg"

interface DoubtInputProps {
  onSubmit: (text: string, file: File | null) => Promise<void>
  isLoading: boolean
}

export function DoubtInput({ onSubmit, isLoading }: DoubtInputProps) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isListening, setIsListening] = useState(false)
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

  function handleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    setIsListening(true)
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResult[])
        .map((r) => r[0].transcript)
        .join("")
      setText((prev) => prev + transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.start()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative transition-colors ${isDragging ? "ring-2 ring-primary rounded-xl" : ""}`}
      >
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/50">
          <PatternBg variant="dots" className="opacity-30" />
          <Textarea
            placeholder="Type your doubt here... (e.g., 'What is the derivative of x²?')"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            className="min-h-[120px] resize-none pr-20 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 relative"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleVoice}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                isListening
                  ? "bg-destructive/10 text-destructive animate-pulse"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              disabled={isLoading}
              title="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              onClick={() => fileRef.current?.click()}
              disabled={isLoading}
              title="Upload image"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
          </div>
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/5 border-2 border-dashed border-primary pointer-events-none z-10">
              <p className="text-sm font-medium text-primary">Drop image here</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
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
          <button
            type="button"
            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border text-muted-foreground hover:text-foreground transition-colors"
            onClick={clearFile}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" disabled={(!text.trim() && !file) || isLoading}>
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
