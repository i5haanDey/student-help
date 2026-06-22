import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { PracticeAttemptSchema } from "@/lib/validators"

export const POST = withAuth(async ({ req, params, profile }) => {
  const { id } = params
  const { questionId, studentAnswer, isCorrect } = PracticeAttemptSchema.parse(await req.json())

  const practiceSet = await prisma.practiceSet.findUnique({ where: { id } })
  if (!practiceSet) return NextResponse.json({ error: "Practice set not found" }, { status: 404 })

  if (practiceSet.studentId !== profile.id) {
    return NextResponse.json({ error: "Not your practice set" }, { status: 403 })
  }

  const attempt = await prisma.practiceAttempt.create({
    data: {
      practiceSetId: id,
      questionId,
      studentAnswer,
      isCorrect,
    },
  })

  return NextResponse.json(attempt)
})
