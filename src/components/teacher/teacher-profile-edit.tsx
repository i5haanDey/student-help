"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "History", "Geography",
  "Economics", "Accountancy", "Hindi", "Sanskrit",
]

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Other"]

interface TeacherProfileEditProps {
  profile: {
    id: string
    displayName: string
    bio: string | null
    subjects: string[]
    teachingLanguages: string[]
    hourlyRateInr: number | null
    timezone: string
    avatarUrl: string | null
  }
}

export function TeacherProfileEdit({ profile }: TeacherProfileEditProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    subjects: profile.subjects,
    teachingLanguages: profile.teachingLanguages,
    hourlyRateInr: profile.hourlyRateInr?.toString() ?? "",
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

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Profile updated!")
      router.refresh()
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/teacher")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your teaching profile and rates.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="min-h-[100px]" />
        </div>
        <div className="space-y-2">
          <Label>Subjects</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <Badge key={s} variant={form.subjects.includes(s) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSubject(s)}>
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Teaching Languages</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Badge key={l} variant={form.teachingLanguages.includes(l) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleLanguage(l)}>
                {l}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Hourly Rate (₹)</Label>
          <Input type="number" value={form.hourlyRateInr} onChange={(e) => setForm({ ...form, hourlyRateInr: e.target.value })} />
        </div>
        <Button className="w-full" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  )
}
