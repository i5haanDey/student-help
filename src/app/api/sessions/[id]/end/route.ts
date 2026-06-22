import { NextResponse } from "next/server"
import { withAuth } from "@/lib/with-auth"
import { endSession } from "@/services/session.service"

export const POST = withAuth(async ({ params }) => {
  const { id } = params

  try {
    const result = await endSession(id)
    return NextResponse.json({
      success: true,
      endedAt: result.endedAt.toISOString(),
      teacherPayout: result.teacherPayout,
      refundToStudent: result.refundToStudent,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const status = message === "Session not found" ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
})
