import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password, displayName, role } = await req.json()

    if (!email || !password || !displayName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.create({
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
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Registration error:", error)
    const message = error instanceof Error && error.message.includes("connect")
      ? "Database connection failed. Make sure your DATABASE_URL points to a running PostgreSQL database."
      : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
