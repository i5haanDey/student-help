import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { ProfileUpdateSchema } from "@/lib/validators"

export const PUT = withAuth(async ({ req, profile }) => {
  try {
    const { displayName, bio, subjects, teachingLanguages, hourlyRateInr } = ProfileUpdateSchema.parse(await req.json())

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        displayName: displayName ?? profile.displayName,
        bio: bio ?? undefined,
        subjects: subjects ?? undefined,
        teachingLanguages: teachingLanguages ?? undefined,
        hourlyRateInr: hourlyRateInr ?? undefined,
      },
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
