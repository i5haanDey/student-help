import { NextResponse } from "next/server"
import { expireOldBookings } from "@/services/booking.service"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const expected = process.env.CRON_SECRET
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const count = await expireOldBookings()
    return NextResponse.json({ success: true, expired: count })
  } catch (error) {
    console.error("[cron/expire-bookings]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
