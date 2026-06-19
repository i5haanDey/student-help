import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { SessionPage } from "@/components/session/session-page"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Session ${id.slice(0, 8)}... - Student Help`,
    description: "Join your live teaching session.",
  }
}

export default async function TeacherSessionDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "teacher") redirect(`/${session.user.role}`)

  const { id } = await props.params

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  return <SessionPage role="teacher" bookingId={id} profileId={profile?.id ?? ""} />
}
