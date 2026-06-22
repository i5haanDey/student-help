import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { VerificationSubmitSchema } from "@/lib/validators"

export const POST = withAuth(async ({ req, profile }) => {
  if (profile.role !== "teacher") {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 })
  }

  try {
    const { idType, idNumber, credentials, teachingDemo } = VerificationSubmitSchema.parse(await req.json())

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
})
