import type { Metadata } from "next"
import { TeacherOnboarding } from "@/components/auth/teacher-onboarding"

export const metadata: Metadata = {
  title: "Teacher Setup - Student Help",
  description: "Set up your teacher profile to start tutoring.",
}

export default function TeacherOnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <TeacherOnboarding />
    </div>
  )
}
