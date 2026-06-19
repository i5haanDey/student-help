import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SessionsList } from "@/components/booking/sessions-list"

export const metadata: Metadata = {
  title: "My Sessions - Student Help",
  description: "View your past and upcoming tutoring sessions.",
}

export default async function StudentSessionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Sessions</h1>
      <SessionsList role="student" />
    </div>
  )
}
