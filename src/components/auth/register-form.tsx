"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, GraduationCap, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

type Role = "student" | "teacher"

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<"role" | "details">("role")
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ displayName: "", email: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateField(name: string, value: string) {
    if (name === "displayName" && !value.trim()) return "Name is required"
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Valid email required"
    if (name === "password" && value.length < 6) return "At least 6 characters"
    if (name === "confirmPassword" && value !== form.password) return "Passwords must match"
    return ""
  }

  function handleFieldChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
          role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Registration failed")
        return
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.error("Sign in failed after registration")
        return
      }

      if (role === "student") {
        router.push("/onboarding/student")
      } else {
        router.push("/onboarding/teacher")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "role") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Student Help</CardTitle>
          <CardDescription>Choose how you want to use the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            onClick={() => { setRole("student"); setStep("details") }}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">I&apos;m a Student</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get AI doubt solving, book live teacher sessions, and track your mastery.
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setRole("teacher"); setStep("details") }}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">I&apos;m a Teacher</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Offer your expertise, conduct live sessions, and earn from teaching.
                </p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {role === "student" ? "Create Student Account" : "Create Teacher Account"}
        </CardTitle>
        <CardDescription>
          Fill in your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="displayName">Full Name</Label>
            <Input
              id="displayName"
              placeholder="John Doe"
              value={form.displayName}
              onChange={(e) => handleFieldChange("displayName", e.target.value)}
              className={errors.displayName ? "border-destructive" : ""}
            />
            {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                minLength={6}
                className={errors.password ? "border-destructive pr-9" : "pr-9"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setStep("role")} className="w-full" disabled={isLoading}>
              Back
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
