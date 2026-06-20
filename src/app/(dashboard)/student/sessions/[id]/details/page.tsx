import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { SessionDetailsView } from "@/components/session/session-details"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Session Details ${id.slice(0, 8)}... - Student Help`,
    description: "View your completed session details.",
  }
}

export default async function StudentSessionDetailsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  const { id } = await props.params

  return <SessionDetailsView bookingId={id} role="student" />
}
