"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, IndianRupee, Clock, Zap, CalendarDays } from "lucide-react"
import { toast } from "sonner"

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "History", "Geography", "Economics",
]

const DURATIONS = [30, 45, 60, 90, 120]

export function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get("teacher")
  const [teacher, setTeacher] = useState<{
    id: string
    displayName: string
    avatarUrl: string | null
    subjects: string[]
    hourlyRateInr: number | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingTeacher, setIsFetchingTeacher] = useState(!!teacherId)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    subject: "",
    doubtContext: "",
    sessionType: "instant" as "instant" | "scheduled",
    durationMinutes: 60,
    startsAt: "",
  })

  useEffect(() => {
    if (!teacherId) return
    fetch(`/api/teachers/${teacherId}`)
      .then((r) => r.json())
      .then((data) => {
        setTeacher(data)
        if (data?.subjects?.[0]) setForm((f) => ({ ...f, subject: data.subjects[0] }))
      })
      .catch(console.error)
      .finally(() => setIsFetchingTeacher(false))
  }, [teacherId])

  const rate = teacher?.hourlyRateInr ?? 500
  const amount = Math.round((rate / 60) * form.durationMinutes)
  const platformFee = Math.round(amount * 0.1)
  const total = amount + platformFee

  async function handleCreateBooking() {
    if (!form.subject) { toast.error("Select a subject"); return }

    setIsLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacherId ?? "pending",
          subject: form.subject,
          doubtContext: form.doubtContext || undefined,
          sessionType: form.sessionType,
          durationMinutes: form.durationMinutes,
          startsAt: form.sessionType === "scheduled" ? form.startsAt : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Failed to create booking"); return }

      setBookingId(data.id)
      setShowPayment(true)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePay() {
    if (!bookingId) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Payment failed"); return }

      toast.success("Payment successful! Session confirmed.")
      router.push("/student/sessions")
      router.refresh()
    } catch {
      toast.error("Payment failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetchingTeacher) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showPayment && bookingId) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Payment</CardTitle>
          <CardDescription>Secure your session with one-time payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Session Fee</span><span>₹{amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Platform Fee (10%)</span><span>₹{platformFee.toLocaleString()}</span></div>
            <Separator />
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          </div>
          <Button className="w-full" onClick={handlePay} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ₹${total.toLocaleString()}`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Test mode: No real payment will be charged.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book a Session</CardTitle>
        <CardDescription>
          {teacher ? `Booking with ${teacher.displayName}` : "Fill in the details to book a session."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {teacher && (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {teacher.displayName.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm">{teacher.displayName}</p>
              <p className="text-xs text-muted-foreground">₹{rate}/hr · {teacher.subjects?.slice(0, 3).join(", ")}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Session Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, sessionType: "instant" })}
              className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                form.sessionType === "instant" ? "border-primary bg-primary/5" : "hover:border-primary/50"
              }`}
            >
              <Zap className={`h-5 w-5 ${form.sessionType === "instant" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium text-sm">Instant</p>
                <p className="text-xs text-muted-foreground">Start immediately if teacher is available</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, sessionType: "scheduled" })}
              className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${
                form.sessionType === "scheduled" ? "border-primary bg-primary/5" : "hover:border-primary/50"
              }`}
            >
              <CalendarDays className={`h-5 w-5 ${form.sessionType === "scheduled" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium text-sm">Scheduled</p>
                <p className="text-xs text-muted-foreground">Book for a specific date & time</p>
              </div>
            </button>
          </div>
        </div>

        {form.sessionType === "scheduled" && (
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Duration</Label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setForm({ ...form, durationMinutes: d })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${
                  form.durationMinutes === d ? "border-primary bg-primary/5 text-primary font-medium" : "hover:border-primary/50"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {d} min
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Doubt Context (optional)</Label>
          <Textarea
            value={form.doubtContext}
            onChange={(e) => setForm({ ...form, doubtContext: e.target.value })}
            placeholder="Briefly describe what you need help with..."
            className="min-h-[80px]"
          />
        </div>

        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span>Rate: ₹{rate}/hr · {form.durationMinutes} min</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Estimated Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <Button className="w-full" onClick={handleCreateBooking} disabled={isLoading || !teacherId}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to Payment"}
        </Button>
      </CardContent>
    </Card>
  )
}
