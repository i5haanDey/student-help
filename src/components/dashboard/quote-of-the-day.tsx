"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { fadeUp } from "@/lib/animations"
import { getTodayQuote } from "@/lib/quotes"

export function QuoteOfTheDay() {
  const quote = getTodayQuote()

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background via-muted/30 to-muted/50 p-[1px] shadow-sm hover:shadow-md dark:shadow-none"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Decorative gradient blur */}
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-[50px] transition-all duration-500 group-hover:bg-indigo-500/20" />
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-500/10 blur-[50px] transition-all duration-500 group-hover:bg-purple-500/20" />

      <div className="relative h-full rounded-[23px] bg-card/40 p-6 backdrop-blur-xl md:p-8">
        <div className="flex flex-col h-full justify-between gap-6">
          
          {/* Header & Icon */}
          <div className="flex items-start justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Daily Inspiration
              </span>
            </div>
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 3,
                ease: "easeInOut",
              }}
            >
              <Quote className="h-8 w-8 text-indigo-500/20" />
            </motion.div>
          </div>

          {/* Quote Text */}
          <blockquote className="relative">
            <p className="text-lg md:text-xl font-medium leading-relaxed tracking-tight text-foreground/90 italic">
              &ldquo;{quote.text}&rdquo;
            </p>
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-transparent" />
            <span className="text-sm font-semibold tracking-wider text-indigo-500/80 uppercase">
              {quote.author}
            </span>
          </div>
          
        </div>
      </div>
    </motion.div>
  )
}
