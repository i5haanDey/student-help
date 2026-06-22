import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

const SEED_KEY = process.env.SEED_SECRET
const COMMON_PASSWORD = "test123"

const TEACHERS = [
  {
    email: "rajesh@test.com",
    displayName: "Rajesh Kumar",
    bio: "Mathematics expert with 5+ years of JEE coaching experience. Specializes in Calculus, Algebra, and Coordinate Geometry.",
    subjects: ["Mathematics"],
    teachingLanguages: ["Hindi", "English"],
    hourlyRateInr: 300,
    compositeScore: 88,
  },
  {
    email: "priya@test.com",
    displayName: "Priya Sharma",
    bio: "Physics professor with PhD. 8 years of experience teaching Mechanics, Thermodynamics, and Electromagnetism.",
    subjects: ["Physics"],
    teachingLanguages: ["English", "Hindi"],
    hourlyRateInr: 500,
    compositeScore: 92,
  },
  {
    email: "amit@test.com",
    displayName: "Amit Singh",
    bio: "Chemistry tutor specializing in Organic and Physical Chemistry. 4 years of experience with NEET/JEE students.",
    subjects: ["Chemistry"],
    teachingLanguages: ["Hindi", "English"],
    hourlyRateInr: 400,
    compositeScore: 85,
  },
  {
    email: "sneha@test.com",
    displayName: "Sneha Patel",
    bio: "Biology expert with 6 years of teaching experience. Covers Zoology, Botany, and Genetics in depth.",
    subjects: ["Biology"],
    teachingLanguages: ["English", "Gujarati", "Hindi"],
    hourlyRateInr: 350,
    compositeScore: 78,
  },
  {
    email: "vikram@test.com",
    displayName: "Vikram Joshi",
    bio: "Senior software engineer turned CS tutor. Teaches Python, Java, DSA, and Web Development.",
    subjects: ["Computer Science"],
    teachingLanguages: ["English", "Hindi"],
    hourlyRateInr: 600,
    compositeScore: 90,
  },
  {
    email: "deepika@test.com",
    displayName: "Deepika Gupta",
    bio: "Dual-subject expert in Mathematics and Physics. 7 years of experience teaching CBSE and JEE aspirants.",
    subjects: ["Mathematics", "Physics"],
    teachingLanguages: ["English", "Hindi"],
    hourlyRateInr: 450,
    compositeScore: 82,
  },
]

function generateTimeSlots(profileId: string) {
  const slots: { teacherId: string; slotStart: Date; slotEnd: Date }[] = []
  const now = new Date()
  for (let day = 1; day <= 7; day++) {
    const base = new Date(now)
    base.setDate(base.getDate() + day)
    base.setHours(0, 0, 0, 0)

    const morning = new Date(base)
    morning.setHours(10, 0, 0, 0)
    slots.push({
      teacherId: profileId,
      slotStart: morning,
      slotEnd: new Date(morning.getTime() + 60 * 60 * 1000),
    })

    const afternoon = new Date(base)
    afternoon.setHours(15, 0, 0, 0)
    slots.push({
      teacherId: profileId,
      slotStart: afternoon,
      slotEnd: new Date(afternoon.getTime() + 60 * 60 * 1000),
    })
  }
  return slots
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")

  if (!SEED_KEY) {
    return NextResponse.json(
      { error: "SEED_SECRET not configured in environment variables" },
      { status: 500 }
    )
  }

  if (key !== SEED_KEY) {
    return NextResponse.json({ error: "Invalid seed key" }, { status: 401 })
  }

  const passwordHash = await bcrypt.hash(COMMON_PASSWORD, 12)

  const created: string[] = []
  const skipped: string[] = []

  for (const t of TEACHERS) {
    const existing = await prisma.user.findUnique({ where: { email: t.email } })
    if (existing) {
      skipped.push(t.email)
      continue
    }

    const user = await prisma.user.create({
      data: {
        email: t.email,
        passwordHash,
        role: "teacher",
        authProvider: "email",
        profile: {
          create: {
            displayName: t.displayName,
            role: "teacher",
            bio: t.bio,
            subjects: t.subjects,
            teachingLanguages: t.teachingLanguages,
            hourlyRateInr: t.hourlyRateInr,
            verificationStatus: "approved",
            isAvailableNow: true,
            compositeScore: t.compositeScore,
            totalSessions: Math.floor(Math.random() * 50) + 10,
            rank: t.compositeScore >= 85 ? "Top Mentor" : "verified",
            timezone: "Asia/Kolkata",
          },
        },
      },
      include: { profile: true },
    })

    if (user.profile) {
      const slots = generateTimeSlots(user.profile.id)
      await prisma.teacherAvailabilitySlot.createMany({ data: slots })
    }

    created.push(t.email)
  }

  const adminEmail = "admin@studenthelp.com"
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: "admin",
        authProvider: "email",
        profile: {
          create: {
            displayName: "Admin User",
            role: "admin",
            timezone: "Asia/Kolkata",
          },
        },
      },
    })
    created.push(adminEmail)
  } else {
    skipped.push(adminEmail)
  }

  const studentEmail = "student@test.com"
  const existingStudent = await prisma.user.findUnique({ where: { email: studentEmail } })
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash,
        role: "student",
        authProvider: "email",
        profile: {
          create: {
            displayName: "Test Student",
            role: "student",
            gradeLevel: "Class 12",
            examTargets: ["JEE Main", "JEE Advanced"],
            preferredLanguages: ["English", "Hindi"],
            timezone: "Asia/Kolkata",
          },
        },
      },
    })
    created.push(studentEmail)
  } else {
    skipped.push(studentEmail)
  }

  return NextResponse.json({
    success: true,
    message: `Created: ${created.length} accounts. Skipped (already exist): ${skipped.length} accounts.`,
    created,
    skipped,
    login: {
      password: COMMON_PASSWORD,
      teachers: TEACHERS.map((t) => ({ email: t.email, name: t.displayName })),
      admin: adminEmail,
      student: studentEmail,
    },
  })
}
