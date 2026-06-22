import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { TeacherOnboardingSchema } from "@/lib/validators"

export const POST = withAuth(async ({ req, profile }) => {
  try {
    const data = TeacherOnboardingSchema.parse(await req.json())

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        subjects: data.subjects,
        teachingLanguages: data.teachingLanguages,
        hourlyRateInr: data.hourlyRateInr,
        timezone: data.timezone,
        verificationStatus: "pending",
      },
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (error) {
    console.error("Teacher onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
