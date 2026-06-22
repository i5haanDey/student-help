import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { aiSolveDoubt } from "@/lib/ai-service"
import { rateLimitMiddleware } from "@/lib/rate-limit"

export const POST = withAuth(async ({ req, profile }) => {
  const rateCheck = rateLimitMiddleware(profile.id, "doubt:solve", 5, 60_000)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.resetAt - Date.now()) / 1000)}s.` },
      { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(rateCheck.resetAt) } }
    )
  }
  try {
    const formData = await req.formData()
    const text = (formData.get("text") as string) ?? ""
    const image = formData.get("image") as File | null

    if (!text.trim() && !image) {
      return NextResponse.json({ error: "No doubt provided" }, { status: 400 })
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
})
