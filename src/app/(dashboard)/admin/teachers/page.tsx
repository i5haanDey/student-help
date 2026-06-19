import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Teacher Verifications - Student Help",
  description: "Approve or reject teacher verification requests.",
}
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { approveTeacher, rejectTeacher } from "@/server/admin/actions"

export default async function AdminTeachersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") redirect(`/${session.user.role}`)

  const pendingTeachers = await prisma.profile.findMany({
    where: { role: "teacher", verificationStatus: { in: ["pending", "under_review"] } },
    include: { user: { select: { email: true } } },
    orderBy: { id: "desc" },
  })

  const resolvedTeachers = await prisma.profile.findMany({
    where: { role: "teacher", verificationStatus: { in: ["approved", "rejected"] } },
    include: { user: { select: { email: true } } },
    orderBy: { id: "desc" },
    take: 20,
  })

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Teacher Verification Queue</h1>

      <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
      {pendingTeachers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pending verifications.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-10">
          {pendingTeachers.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{t.displayName}</p>
                    <p className="text-sm text-muted-foreground">{t.user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.subjects?.join(", ")}</p>
                    {t.verificationDocs && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">View verification details</summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded max-w-lg overflow-auto">
                          {JSON.stringify(t.verificationDocs, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.verificationStatus === "under_review" ? "warning" : "outline"}>
                      {t.verificationStatus}
                    </Badge>
                    <form action={approveTeacher.bind(null, t.id)}>
                      <Button type="submit" size="sm" variant="outline" className="text-emerald-600">
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </form>
                    <form action={rejectTeacher.bind(null, t.id)}>
                      <Button type="submit" size="sm" variant="outline" className="text-red-600">
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {resolvedTeachers.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Recently Resolved</h2>
          <div className="space-y-3">
            {resolvedTeachers.map((t) => (
              <Card key={t.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{t.displayName}</p>
                      <p className="text-sm text-muted-foreground">{t.user.email}</p>
                    </div>
                    <Badge variant={t.verificationStatus === "approved" ? "default" : "destructive"}>
                      {t.verificationStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
