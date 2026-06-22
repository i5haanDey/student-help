import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

const ALLOWED_PATCH_FIELDS = [
  "teacherJoinedAt",
  "studentJoinedAt",
  "actualStartAt",
  "teacherDurationMs",
  "studentDurationMs",
  "disconnectedAt",
  "admittedAt",
  "extensionRequestedBy",
  "extensionRequestedMin",
  "extensionExpiresAt",
] as const

type AllowedField = typeof ALLOWED_PATCH_FIELDS[number]

function isAllowedField(field: string): field is AllowedField {
  return ALLOWED_PATCH_FIELDS.includes(field as AllowedField)
}

const TEACHER_ONLY_FIELDS = new Set<AllowedField>([
  "teacherJoinedAt",
  "teacherDurationMs",
  "admittedAt",
])

export const PATCH = withAuth(async ({ req, params, profile }) => {
  const { id } = params
  const body = await req.json()

  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    include: { booking: true },
  })

  if (!liveSession) {
    return NextResponse.json({ error: "Live session not found" }, { status: 404 })
  }

  const isTeacher = liveSession.booking.teacherId === profile.id
  const isStudent = liveSession.booking.studentId === profile.id

  if (!isTeacher && !isStudent) {
    return NextResponse.json({ error: "Not your session" }, { status: 403 })
  }

  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (!isAllowedField(key)) {
      return NextResponse.json({ error: `Field "${key}" is not allowed` }, { status: 400 })
    }
    if (isStudent && TEACHER_ONLY_FIELDS.has(key)) {
      return NextResponse.json({ error: `Field "${key}" is teacher-only` }, { status: 403 })
    }
    if (typeof value === "string" && key.endsWith("At")) {
      data[key] = new Date(value)
    } else {
      data[key] = value
    }
  }

  const updated = await prisma.liveSession.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
})
