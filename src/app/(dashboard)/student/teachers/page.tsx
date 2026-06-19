import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TeacherSearch } from "@/components/teacher/teacher-search"

export const metadata: Metadata = {
  title: "Find a Teacher - Student Help",
  description: "Browse verified teachers by subject, rate, and availability.",
}

export default async function TeachersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      <TeacherSearch />
    </div>
  )
}
