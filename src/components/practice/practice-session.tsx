"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle, XCircle, RotateCcw, Sparkles } from "lucide-react"
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Practice
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate AI-powered practice questions to test your knowledge.
          </p>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Ready to Practice?</CardTitle>
            <CardDescription>
              Get 8 questions (3 Easy, 3 Medium, 2 Advanced) on {subject ?? "your selected subject"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-12 text-base" onClick={generatePractice} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Practice Set"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Practice Session</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions &middot; {subject ?? "General"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={generatePractice} disabled={isLoading}>
          <RotateCcw className="h-4 w-4 mr-2" /> New Set
        </Button>
      </div>

      {submitted && (
        <Card className={score >= 60 ? "border-emerald-500/50" : "border-amber-500/50"}>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="text-4xl font-bold">{score}%</div>
            <p className="text-sm text-muted-foreground">
              {score >= 80 ? "Excellent!" : score >= 60 ? "Good job!" : "Keep practicing!"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((q, i) => {
          const badge = getTypeBadge(q.type)
          const isCorrect = results[q.id]
          const selected = answers[q.id]

          return (
            <Card key={q.id} className={
              submitted
                ? isCorrect ? "border-emerald-500/30" : "border-red-500/30"
                : ""
            }>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground font-mono text-xs">Q{i + 1}</span>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  {submitted && (
                    isCorrect
                      ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                      : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </div>

                <p className="text-sm font-medium">{q.question}</p>

                {q.options && (
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const isSelected = selected === opt
                      const isAnswer = q.answer === opt
                      let className = "w-full text-left px-3 py-2 rounded-md border text-sm transition-all"

                      if (submitted) {
                        if (isAnswer) className += " border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        else if (isSelected && !isAnswer) className += " border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                        else className += " border-border opacity-60"
                      } else {
                        className += isSelected
                          ? " border-primary bg-primary/10"
                          : " hover:border-primary/50 cursor-pointer"
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
                  <>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      <p><span className="font-medium text-foreground">Answer:</span> {q.answer}</p>
                      <p className="mt-1"><span className="font-medium text-foreground">Explanation:</span> {q.explanation}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!submitted && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < (questions?.length ?? 0)}
          >
            Submit Answers
          </Button>
        </div>
      )}

      {submitted && (
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={generatePractice}>
            <RotateCcw className="h-4 w-4 mr-2" /> Try Another Set
          </Button>
        </div>
      )}
    </div>
  )
}
