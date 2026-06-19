import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { aiGenerateSummary } from "@/lib/ai-service"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userSession = await auth()
  if (!userSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    const liveSession = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        booking: {
          select: { subject: true, doubtContext: true },
        },
      },
    })

    if (!liveSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const subject = liveSession.booking?.subject ?? "General"
    const context = liveSession.booking?.doubtContext ?? undefined
    const transcript = liveSession.transcriptText ?? undefined

    const summary = await aiGenerateSummary(subject, context ? [context] : undefined, transcript)

    await prisma.liveSession.update({
      where: { id },
      data: { summaryText: summary, aiSummaryStatus: "completed" },
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
