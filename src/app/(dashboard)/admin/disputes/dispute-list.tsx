"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Dispute {
  id: string
  subject: string
  studentName: string
  teacherName: string
  amount: number
  date: string
}

export function DisputeList({ disputes }: { disputes: Dispute[] }) {
  const router = useRouter()
  const [resolving, setResolving] = useState<string | null>(null)

  async function resolveDispute(id: string, action: "refund" | "release") {
    setResolving(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "refund" ? "cancelled" : "completed",
        }),
      })

      if (!res.ok) throw new Error()
      toast.success(action === "refund" ? "Refund processed" : "Payment released to teacher")
      router.refresh()
    } catch {
      toast.error("Failed to resolve dispute")
    } finally {
      setResolving(null)
    }
  }

  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No disputed sessions.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {disputes.map((d) => (
        <Card key={d.id}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold">{d.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {d.studentName} vs {d.teacherName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(d.date).toLocaleDateString()} &middot; ₹{d.amount.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="destructive">Disputed</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resolveDispute(d.id, "refund")}
                  disabled={resolving === d.id}
                  className="gap-1.5"
                >
                  {resolving === d.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  Refund Student
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => resolveDispute(d.id, "release")}
                  disabled={resolving === d.id}
                  className="gap-1.5"
                >
                  {resolving === d.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  Release Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}