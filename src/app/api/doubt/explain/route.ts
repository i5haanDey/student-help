import { NextResponse } from "next/server"
import { withAuth } from "@/lib/with-auth"
import { DoubtExplainSchema } from "@/lib/validators"
import { aiExplainDifferently } from "@/lib/ai-service"
import { rateLimitMiddleware } from "@/lib/rate-limit"

export const POST = withAuth(async ({ req, profile }) => {
  const rateCheck = rateLimitMiddleware(profile.id, "doubt:explain", 10, 60_000)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.resetAt - Date.now()) / 1000)}s.` },
      { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(rateCheck.resetAt) } }
    )
  }
  try {
    const { mode, doubtText } = DoubtExplainSchema.parse(await req.json())
    const result = await aiExplainDifferently(mode, doubtText)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Explain error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
