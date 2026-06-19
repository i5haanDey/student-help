"use server"

import { prisma } from "@/lib/db"
import { signIn as nextAuthSignIn } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function signInWithCredentials(params: {
  email: string
  password: string
}) {
  const { email, password } = params

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  })

  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password" }
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return { error: "Invalid email or password" }
  }

  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch {
    return { error: "Sign in failed" }
  }

  return {
    success: true,
    role: user.role,
    onboardingComplete: !!user.profile?.gradeLevel || user.role !== "student",
  }
}
