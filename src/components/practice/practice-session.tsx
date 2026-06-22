"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle, XCircle, RotateCcw, Sparkles } from "lucide-react"
import { staggerContainer, fadeUp, listItemVariants } from "@/lib/animations"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"
import type { PracticeQuestion } from "@/types"

interface PracticeSessionProps {
  subject?: string
}

export function PracticeSession({ subject }: PracticeSessionProps) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [practiceSetId, setPracticeSetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  async function generatePractice() {
    setIsLoading(true)
    setSubmitted(false)
    setAnswers({})
    setResults({})
    setScore(0)

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "", subject: subject ?? "Mathematics" }),
      })
      const data = await res.json()
      setQuestions(Array.isArray(data.questions) ? data.questions : [])
      setPracticeSetId(data.id ?? null)
    } catch {
      // handle error
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    let correct = 0
    const newResults: Record<string, boolean> = {}

    for (const q of questions) {
      const isCorrect = answers[q.id] === q.answer
      newResults[q.id] = isCorrect
      if (isCorrect) correct++

      if (practiceSetId) {
        await fetch(`/api/practice/${practiceSetId}/attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: q.id,
            studentAnswer: answers[q.id] ?? "",
            isCorrect,
          }),
        }).catch(() => {})
      }
    }

    setResults(newResults)
    setSubmitted(true)
    const pct = Math.round((correct / questions.length) * 100)
    setScore(pct)

    if (practiceSetId) {
      await fetch("/api/mastery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject ?? "Mathematics", practiceScore: pct }),
      }).catch(() => {})
    }
  }

  function getTypeBadge(type: string) {
    const config: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      easy: { variant: "secondary", label: "Easy" },
      medium: { variant: "outline", label: "Medium" },
      advanced: { variant: "default", label: "Advanced" },
    }
    return config[type] ?? { variant: "outline", label: type }
  }

  if (!questions || questions.length === 0) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            Practice
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-12">
            Generate AI-powered practice questions to test your knowledge.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="max-w-lg mx-auto">
          <Card className="text-center border-border/60 overflow-hidden">
            <PatternBg variant="dots" className="opacity-30" />
            <CornerArc className="top-0 right-0" size={120} />
            <CardHeader className="relative">
              <div className="flex justify-center mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Ready to Practice?</CardTitle>
              <CardDescription className="max-w-sm mx-auto">
                Get 8 questions (3 Easy, 3 Medium, 2 Advanced) on {subject ?? "your selected subject"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" onClick={generatePractice} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate Practice Set"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Practice Session</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions &middot; {subject ?? "General"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={generatePractice} disabled={isLoading}>
          <RotateCcw className="h-4 w-4 mr-2" /> New Set
        </Button>
      </motion.div>

      {submitted && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className={`${score >= 60 ? "border-emerald-500/30" : "border-amber-500/30"} overflow-hidden`}>
            <PatternBg variant="crosshatch" className="opacity-25" />
            <CardContent className="pt-8 text-center space-y-3 relative">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{score}%</div>
              <div className="text-sm text-muted-foreground">
                {score >= 80 ? "Excellent work!" : score >= 60 ? "Good job!" : "Keep practicing!"}
              </div>
              <div className="h-2 max-w-xs mx-auto rounded-full bg-muted/70 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        {questions.map((q, i) => {
          const badge = getTypeBadge(q.type)
          const isCorrect = results[q.id]
          const selected = answers[q.id]

          return (
            <motion.div
              key={q.id}
              custom={i}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className={
                submitted
                  ? isCorrect ? "border-emerald-500/30 overflow-hidden" : "border-red-500/30 overflow-hidden"
                  : "overflow-hidden"
              }>
                {submitted && <PatternBg variant={isCorrect ? "dots" : "crosshatch"} className="opacity-20" />}
                <CardContent className="pt-5 space-y-4 relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/70 text-xs font-mono font-semibold">{i + 1}</span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    {submitted && (
                      isCorrect
                        ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-sm font-medium leading-relaxed">{q.question}</p>

                  {q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = selected === opt
                        const isAnswer = q.answer === opt
                        let className = "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all duration-200"

                        if (submitted) {
                          if (isAnswer) className += " border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium"
                          else if (isSelected && !isAnswer) className += " border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                          else className += " border-border/50 opacity-50"
                        } else {
                          className += isSelected
                            ? " border-primary bg-primary/10 font-medium"
                            : " border-border/60 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            className={className}
                            onClick={() => {
                              if (!submitted) setAnswers({ ...answers, [q.id]: opt })
                            }}
                            disabled={submitted}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <Separator />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-semibold text-foreground">Answer:</span> {q.answer}</p>
                        <p><span className="font-semibold text-foreground">Explanation:</span> {q.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {!submitted && (
        <motion.div variants={fadeUp} className="flex justify-center">
          <Button
            size="lg"
            className="h-12 px-10 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < (questions?.length ?? 0)}
          >
            Submit Answers
          </Button>
        </motion.div>
      )}

      {submitted && (
        <motion.div variants={fadeUp} className="flex justify-center gap-3">
          <Button variant="outline" size="lg" onClick={generatePractice}>
            <RotateCcw className="h-4 w-4 mr-2" /> Try Another Set
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
