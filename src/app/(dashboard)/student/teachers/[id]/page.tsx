import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { TeacherProfileView } from "@/components/teacher/teacher-profile"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const profile = await prisma.profile.findUnique({ where: { id }, select: { displayName: true } })
  return {
    title: `${profile?.displayName ?? "Teacher"} - Student Help`,
    description: `View ${profile?.displayName ?? "teacher"}'s profile, availability, and reviews.`,
  }
}

export default async function TeacherProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <TeacherProfileView />
    </div>
  )
}
