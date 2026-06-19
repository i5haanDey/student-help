"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShieldCheck, Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function TeacherVerification() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    idType: "government_id",
    idNumber: "",
    credentials: "",
    teachingDemo: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/teachers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Verification submission failed")
        return
      }

      toast.success("Verification submitted for review!")
      router.push("/teacher")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Teacher Verification</CardTitle>
            <CardDescription>
              Complete verification to start accepting student bookings.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Badge variant="secondary">Step 1</Badge> Identity Verification
            </h3>
            <div className="space-y-2">
              <Label htmlFor="idType">ID Type</Label>
              <select
                id="idType"
                value={form.idType}
                onChange={(e) => setForm({ ...form, idType: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="government_id">Government ID (Aadhaar/PAN)</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="college_id">College/University ID</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                placeholder="Enter your ID number"
                required
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Badge variant="secondary">Step 2</Badge> Teaching Credentials
            </h3>
            <div className="space-y-2">
              <Label htmlFor="credentials">Qualifications & Experience</Label>
              <Textarea
                id="credentials"
                value={form.credentials}
                onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                placeholder="e.g., B.Ed in Mathematics, 5 years teaching experience, qualified for JEE/NEET coaching..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Badge variant="secondary">Step 3</Badge> Teaching Demo
            </h3>
            <div className="space-y-2">
              <Label htmlFor="teachingDemo">Demo Video Link (optional)</Label>
              <Input
                id="teachingDemo"
                value={form.teachingDemo}
                onChange={(e) => setForm({ ...form, teachingDemo: e.target.value })}
                placeholder="Link to a YouTube/Loom demo of your teaching"
              />
              <p className="text-xs text-muted-foreground">
                Share a short video demonstrating how you explain a concept.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> Submit for Review
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your documents will be reviewed within 24-48 hours. You will be notified once verified.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
