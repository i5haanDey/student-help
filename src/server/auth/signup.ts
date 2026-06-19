"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { Role } from "@/generated/prisma/enums"

export async function signUp(params: {
  email: string
  password: string
  role: Role
  displayName: string
}) {
  const { email, password, role, displayName } = params

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Email already registered" }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      profile: {
        create: {
          displayName,
          role,
        },
      },
    },
    include: { profile: true },
  })

  return { user: { id: user.id, email: user.email, role: user.role } }
}
