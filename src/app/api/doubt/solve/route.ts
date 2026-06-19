import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { aiSolveDoubt } from "@/lib/ai-service"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const text = (formData.get("text") as string) ?? ""
    const image = formData.get("image") as File | null

    if (!text.trim() && !image) {
      return NextResponse.json({ error: "No doubt provided" }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (image && image.size > 5 * 1024 * 1024) {
      const submission = await prisma.aiDoubtSubmission.create({
        data: {
          studentId: profile.id,
          inputType: "image",
          inputFileUrl: "pending-upload",
          isAsync: true,
        },
      })

      return NextResponse.json({
        async: true,
        id: submission.id,
        message: "Image doubt submitted. Will be resolved shortly.",
      })
    }

    let imageBase64: string | undefined
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer())
      imageBase64 = buffer.toString("base64")
    }

    const result = await aiSolveDoubt(text, imageBase64)

    await prisma.aiDoubtSubmission.create({
      data: {
        studentId: profile.id,
        inputType: image ? "image" : "text",
        inputText: text || null,
        inputFileUrl: null,
        subjectDetected: result.subjectDetected,
        confidenceLevel: result.confidenceLevel,
        aiResponseText: result.text,
        isAsync: false,
      },
    })

    return NextResponse.json({
      text: result.text,
      confidenceLevel: result.confidenceLevel,
      subjectDetected: result.subjectDetected,
    })
  } catch (error) {
    console.error("Doubt solve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
