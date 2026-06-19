import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { displayName, bio, subjects, teachingLanguages, hourlyRateInr, timezone } = await req.json()

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        displayName,
        bio,
        subjects,
        teachingLanguages,
        hourlyRateInr: Number(hourlyRateInr),
        timezone,
        verificationStatus: "pending",
      },
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Teacher onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
