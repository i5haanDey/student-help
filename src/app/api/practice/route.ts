import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { PracticeCreateSchema } from "@/lib/validators"
import { aiGeneratePractice } from "@/lib/ai-service"

export const POST = withAuth(async ({ req, profile }) => {
  try {
    const { sessionId, subject } = PracticeCreateSchema.parse(await req.json())

    let context: string | undefined
    if (sessionId) {
      const liveSession = await prisma.liveSession.findUnique({
        where: { id: sessionId },
        include: { booking: { select: { doubtContext: true } } },
      })
      context = liveSession?.booking?.doubtContext ?? undefined
    }

    const questions = await aiGeneratePractice(subject ?? "Mathematics", context)

    const practiceSet = await prisma.practiceSet.create({
      data: {
        sessionId: sessionId ?? "",
        studentId: profile.id,
        subject: subject ?? "General",
        conceptTags: [],
        questions: questions.map((q) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
        status: "pending",
      },
    })

    return NextResponse.json({
      id: practiceSet.id,
      questions,
      subject: practiceSet.subject,
    })
  } catch (error) {
    console.error("Practice generate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
