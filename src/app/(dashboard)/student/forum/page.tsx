import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ForumPlaceholder } from "@/components/dummy/forum-placeholder"

export const metadata: Metadata = {
  title: "Community Forum - Student Help",
  description: "Connect with fellow students and teachers. Coming soon.",
}

export default async function ForumPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return <ForumPlaceholder />
}
