import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PracticeSession } from "@/components/practice/practice-session"

export const metadata: Metadata = {
  title: "Practice - Student Help",
  description: "AI-generated practice questions across three difficulty levels.",
}

export default async function PracticePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
      <PracticeSession />
    </div>
  )
}
