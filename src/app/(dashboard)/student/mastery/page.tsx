import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MasteryDashboard } from "@/components/mastery/mastery-dashboard"

export const metadata: Metadata = {
  title: "Mastery Dashboard - Student Help",
  description: "Track your learning progress and subject mastery scores.",
}

export default async function MasteryPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      <MasteryDashboard />
    </div>
  )
}
