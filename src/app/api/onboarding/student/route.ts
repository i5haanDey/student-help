import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { displayName, gradeLevel, subjects, examTargets, preferredLanguages, timezone } = await req.json()

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        displayName,
        gradeLevel,
        subjects,
        examTargets,
        preferredLanguages,
        timezone,
      },
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
