"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, GraduationCap, Loader2, Eye, EyeOff, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { PatternBg, CornerArc } from "@/components/ui/pattern-bg"

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <AnimatePresence mode="wait">
        {step === "role" ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/60 shadow-xl shadow-primary/5 overflow-hidden">
              <PatternBg variant="crosshatch" className="opacity-30" />
              <CornerArc className="top-0 right-0" size={120} />
              <CardHeader className="text-center pb-4 relative">
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Join Student Help</CardTitle>
                <CardDescription>Choose how you want to use the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 relative">
                <button
                  onClick={() => { setRole("student"); setStep("details") }}
                  className="group w-full p-4 rounded-xl border border-border/60 hover:border-primary/30 transition-all text-left bg-gradient-to-r from-transparent to-transparent hover:from-primary/[0.02] hover:to-primary/[0.01]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/8 to-primary/4 text-primary ring-1 ring-primary/8 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:ring-0 transition-all duration-300">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">I&apos;m a Student</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Get AI doubt solving, book live teacher sessions, and track your mastery.
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => { setRole("teacher"); setStep("details") }}
                  className="group w-full p-4 rounded-xl border border-border/60 hover:border-primary/30 transition-all text-left bg-gradient-to-r from-transparent to-transparent hover:from-primary/[0.02] hover:to-primary/[0.01]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/12 to-secondary/6 text-secondary ring-1 ring-secondary/12 group-hover:bg-gradient-to-br group-hover:from-secondary group-hover:to-secondary/80 group-hover:text-secondary-foreground group-hover:ring-0 transition-all duration-300">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm group-hover:text-secondary transition-colors">I&apos;m a Teacher</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Offer your expertise, conduct live sessions, and earn from teaching.
                      </p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/60 shadow-xl shadow-primary/5 overflow-hidden">
              <PatternBg variant="dots" className="opacity-40" />
              <CornerArc className="top-0 right-0" size={140} />
              <CardHeader className="text-center pb-4 relative">
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                    {role === "student" ? <GraduationCap className="h-6 w-6 text-primary-foreground" /> : <BookOpen className="h-6 w-6 text-primary-foreground" />}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {role === "student" ? "Create Student Account" : "Create Teacher Account"}
                </CardTitle>
                <CardDescription>
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      placeholder="John Doe"
                      value={form.displayName}
                      onChange={(e) => handleFieldChange("displayName", e.target.value)}
                      className={errors.displayName ? "border-destructive ring-destructive/30" : ""}
                    />
                    {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      className={errors.email ? "border-destructive ring-destructive/30" : ""}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={(e) => handleFieldChange("password", e.target.value)}
                        minLength={6}
                        className={errors.password ? "border-destructive ring-destructive/30 pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? "border-destructive ring-destructive/30" : ""}
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" onClick={() => setStep("role")} className="w-full" disabled={isLoading}>
                      Back
                    </Button>
                    <Button type="submit" className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground pt-1">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
