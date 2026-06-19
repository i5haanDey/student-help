import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { questionId, studentAnswer, isCorrect } = await req.json()

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

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
}
