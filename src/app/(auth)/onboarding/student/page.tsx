import type { Metadata } from "next"
import { StudentOnboarding } from "@/components/auth/student-onboarding"

export const metadata: Metadata = {
  title: "Student Setup - Student Help",
  description: "Set up your student profile to get started.",
}

export default function StudentOnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <StudentOnboarding />
    </div>
  )
}
