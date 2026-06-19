import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile || profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  try {
    const { idType, idNumber, credentials, teachingDemo } = await req.json()

    if (!idType || !idNumber) {
      return NextResponse.json({ error: "ID type and number are required" }, { status: 400 })
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        verificationDocs: {
          idType,
          idNumber,
          credentials: credentials ?? "",
          teachingDemo: teachingDemo ?? "",
          submittedAt: new Date().toISOString(),
        },
        verificationStatus: "under_review",
      },
    })

    return NextResponse.json({ success: true, status: "under_review" })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
