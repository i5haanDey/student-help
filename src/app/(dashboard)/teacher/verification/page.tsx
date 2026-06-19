import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TeacherVerification } from "@/components/teacher/teacher-verification"

export const metadata: Metadata = {
  title: "Verification - Student Help",
  description: "Submit your credentials and documents for teacher verification.",
}

export default async function VerificationPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "teacher") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <TeacherVerification />
    </div>
  )
}
