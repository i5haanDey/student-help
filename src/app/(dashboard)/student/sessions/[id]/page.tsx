import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { SessionPage } from "@/components/session/session-page"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Session ${id.slice(0, 8)}... - Student Help`,
    description: "Join your live tutoring session.",
  }
}

export default async function StudentSessionDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  const { id } = await props.params

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  return <SessionPage role="student" bookingId={id} profileId={profile?.id ?? ""} />
}
