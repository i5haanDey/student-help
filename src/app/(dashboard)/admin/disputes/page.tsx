import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { DisputeList } from "./dispute-list"

export const metadata: Metadata = {
  title: "Dispute Resolution - Student Help",
  description: "Review and resolve session disputes.",
}

export default async function AdminDisputesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") redirect(`/${session.user.role}`)

  const disputed = await prisma.booking.findMany({
    where: { status: "disputed" },
    include: {
      student: { select: { displayName: true } },
      teacher: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const disputes = disputed.map((b) => ({
    id: b.id,
    subject: b.subject,
    studentName: b.student.displayName,
    teacherName: b.teacher.displayName,
    amount: Number(b.amountInr ?? 0),
    date: b.createdAt.toISOString(),
  }))

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Dispute Resolution</h1>
      <DisputeList disputes={disputes} />
    </div>
  )
}
