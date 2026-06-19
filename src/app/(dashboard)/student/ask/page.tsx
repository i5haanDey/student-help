import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DoubtSolver } from "@/components/doubt/doubt-solver"

export const metadata: Metadata = {
  title: "AI Doubt Solver - Student Help",
  description: "Get instant AI-powered explanations for your doubts. Upload images or type your questions.",
}

export default async function AskPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
      <DoubtSolver />
    </div>
  )
}
