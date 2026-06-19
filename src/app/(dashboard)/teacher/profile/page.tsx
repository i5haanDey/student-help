import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { TeacherProfileEdit } from "@/components/teacher/teacher-profile-edit"

export const metadata: Metadata = {
  title: "Edit Profile - Student Help",
  description: "Update your teacher profile, subjects, and rates.",
}

export default async function TeacherProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "teacher") redirect(`/${session.user.role}`)

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) redirect("/onboarding/teacher")

  const adaptedProfile = {
    ...profile,
    hourlyRateInr: profile.hourlyRateInr ? Number(profile.hourlyRateInr) : null,
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
      <TeacherProfileEdit profile={adaptedProfile} />
    </div>
  )
}
