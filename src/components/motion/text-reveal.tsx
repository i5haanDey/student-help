"use client"

import { motion } from "framer-motion"

export function TextReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ")
  return (
    <div className={`overflow-hidden flex flex-wrap gap-x-2 ${className ?? ""}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: i * 0.05 }}
          className="inline-block origin-bottom"
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}
