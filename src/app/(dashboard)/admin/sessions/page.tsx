import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video } from "lucide-react"

export const metadata: Metadata = {
  title: "Session Monitoring - Student Help",
  description: "Monitor active and past tutoring sessions.",
}

export default async function AdminSessionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") redirect(`/${session.user.role}`)

  const bookings = await prisma.booking.findMany({
    include: {
      student: { select: { displayName: true } },
      teacher: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Session Monitoring</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No sessions yet.</p>
            </div>
          ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                <div>
                  <p className="font-medium">{b.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.student.displayName} &rarr; {b.teacher.displayName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      b.status === "completed" ? "secondary" :
                      b.status === "in_progress" ? "default" : "outline"
                    }
                  >
                    {b.status}
                  </Badge>
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
