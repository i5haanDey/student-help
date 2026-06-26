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
      <PatternBg variant="dots" className="opacity-20" />
      <GlowSpot
        className="-top-16 -right-16 h-40 w-40"
        color="oklch(0.52 0.24 275)"
      />
      <div className="absolute left-0 inset-y-4 w-1 rounded-full bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
      <div className="relative p-5 md:p-6">
        <div className="flex flex-col gap-3">
          <Quote className="h-5 w-5 text-primary/30" />
          <p className="text-base md:text-lg leading-relaxed text-foreground/90">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
            <span className="text-sm font-medium text-foreground/70 whitespace-nowrap">
              {quote.author}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
