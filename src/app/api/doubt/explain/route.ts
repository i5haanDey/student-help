import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { aiExplainDifferently } from "@/lib/ai-service"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { mode, doubtText } = await req.json()

    if (!mode || !doubtText?.trim()) {
      return NextResponse.json({ error: "mode and doubtText are required" }, { status: 400 })
    }

    const result = await aiExplainDifferently(mode, doubtText)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Explain error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
