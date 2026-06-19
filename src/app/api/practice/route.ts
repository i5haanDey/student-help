import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { aiGeneratePractice } from "@/lib/ai-service"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  try {
    const { sessionId, subject } = await req.json()

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
}
