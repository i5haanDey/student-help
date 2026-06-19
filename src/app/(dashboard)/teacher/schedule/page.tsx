import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AvailabilityManager } from "@/components/teacher/availability-manager"

export const metadata: Metadata = {
  title: "Schedule - Student Help",
  description: "Manage your teaching availability slots.",
}

export default async function SchedulePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "teacher") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
      <AvailabilityManager />
    </div>
  )
}
