"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "History", "Geography",
  "Economics", "Accountancy", "Hindi", "Sanskrit",
]

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Other"]

const steps = ["Profile", "Subjects & Rates", "Verification"]

export function TeacherOnboarding() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    subjects: [] as string[],
    teachingLanguages: [] as string[],
    hourlyRateInr: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  function toggleSubject(s: string) {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s],
    }))
  }

  function toggleLanguage(l: string) {
    setForm((f) => ({
      ...f,
      teachingLanguages: f.teachingLanguages.includes(l)
        ? f.teachingLanguages.filter((x) => x !== l)
        : [...f.teachingLanguages, l],
    }))
  }

  async function handleComplete() {
    setIsLoading(true)

    try {
      const res = await fetch("/api/onboarding/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Failed to save profile")
        return
      }

      await update()
      router.push("/teacher")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 0) return form.displayName.length > 0
    if (step === 1) return form.subjects.length > 0 && form.teachingLanguages.length > 0 && Number(form.hourlyRateInr) > 0
    return true
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <CardTitle className="text-2xl">Set Up Your Teacher Profile</CardTitle>
        <CardDescription>
          {step === 0 && "Tell students about yourself"}
          {step === 1 && "What subjects do you teach?"}
          {step === 2 && "Almost done! Review your profile."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Dr. John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Describe your teaching experience, qualifications, and teaching style..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Subjects you teach</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <Badge
                    key={s}
                    variant={form.subjects.includes(s) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3"
                    onClick={() => toggleSubject(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Teaching Languages</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <Badge
                    key={l}
                    variant={form.teachingLanguages.includes(l) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3"
                    onClick={() => toggleLanguage(l)}
                  >
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (₹ INR)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min={0}
                step={50}
                value={form.hourlyRateInr}
                onChange={(e) => setForm({ ...form, hourlyRateInr: e.target.value })}
                placeholder="500"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold">Profile</h4>
              <p><span className="text-muted-foreground">Name:</span> {form.displayName}</p>
              {form.bio && <p><span className="text-muted-foreground">Bio:</span> {form.bio}</p>}
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold">Subjects & Languages</h4>
              <p><span className="text-muted-foreground">Subjects:</span> {form.subjects.join(", ")}</p>
              <p><span className="text-muted-foreground">Languages:</span> {form.teachingLanguages.join(", ")}</p>
              <p><span className="text-muted-foreground">Rate:</span> ₹{Number(form.hourlyRateInr).toLocaleString()}/hr</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
              <p className="text-amber-800 dark:text-amber-200 font-medium text-xs">
                Your profile will be reviewed by our team after submission. You&apos;ll receive a notification once verified.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Review"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
