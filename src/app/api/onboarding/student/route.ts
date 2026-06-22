import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { StudentOnboardingSchema } from "@/lib/validators"

export const POST = withAuth(async ({ req, profile }) => {
  try {
    const data = StudentOnboardingSchema.parse(await req.json())

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        displayName: data.displayName,
        gradeLevel: data.gradeLevel,
        subjects: data.subjects,
        examTargets: data.examTargets,
        preferredLanguages: data.preferredLanguages,
        timezone: data.timezone,
      },
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
