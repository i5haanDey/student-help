"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { fadeUp } from "@/lib/animations"
import { PatternBg, GlowSpot } from "@/components/ui/pattern-bg"
import { getTodayQuote } from "@/lib/quotes"

export function QuoteOfTheDay() {
  const quote = getTodayQuote()

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <PatternBg variant="arch" className="opacity-20" />
      <GlowSpot
        className="-top-16 -right-16 h-36 w-36"
        color="oklch(0.52 0.24 275)"
      />
      <div className="relative p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/8">
              <Quote className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-sm md:text-base leading-relaxed text-foreground/85 italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground/60 text-right">
              &mdash; {quote.author}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
