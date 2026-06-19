import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export const metadata: Metadata = {
  title: "Earnings - Student Help",
  description: "Track your teaching earnings and session history.",
}
import { DollarSign, Wallet, TrendingUp } from "lucide-react"

export default async function EarningsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "teacher") redirect(`/${session.user.role}`)

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) redirect("/onboarding/teacher")

  const completedSessions = await prisma.booking.findMany({
    where: { teacherId: profile.id, status: "completed" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      student: { select: { displayName: true } },
    },
  })

  const totalEarnings = completedSessions.reduce((sum, b) => sum + Number(b.teacherPayoutInr ?? 0), 0)
  const pendingAmount = Number(profile.earningsPending ?? 0)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          Earnings
        </h1>
        <p className="text-muted-foreground mt-1">Track your earnings and session history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>Your completed sessions and earnings breakdown.</CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No completed sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {completedSessions.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div>
                    <p className="font-medium">{b.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      with {b.student.displayName} &middot; {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{Number(b.teacherPayoutInr ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{b.durationMinutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
