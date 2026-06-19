import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  try {
    const { displayName, bio, subjects, teachingLanguages, hourlyRateInr } = await req.json()

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        displayName: displayName ?? profile.displayName,
        bio: bio ?? profile.bio,
        subjects: subjects ?? profile.subjects,
        teachingLanguages: teachingLanguages ?? profile.teachingLanguages,
        hourlyRateInr: hourlyRateInr ? Number(hourlyRateInr) : profile.hourlyRateInr,
      },
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
