import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { bookingId } = await req.json()

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { id: true, displayName: true } },
        teacher: { select: { id: true, displayName: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.status !== "confirmed" && booking.status !== "pending") {
      return NextResponse.json({ error: "Booking cannot be refunded" }, { status: 400 })
    }

    const refundId = `refund_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        paymentId: null,
      },
    })

    await prisma.notification.create({
      data: {
        userId: booking.student.id,
        title: "Refund Issued",
        body: `Full refund of ₹${Number(booking.amountInr).toLocaleString()} has been issued for your session.`,
        type: "refund",
      },
    })

    await prisma.notification.create({
      data: {
        userId: booking.teacher.id,
        title: "Session Cancelled",
        body: `Session with ${booking.student.displayName} was cancelled due to no-show.`,
        type: "cancellation",
      },
    })

    return NextResponse.json({
      success: true,
      refundId,
      amountInr: Number(booking.amountInr),
    })
  } catch (error) {
    console.error("Refund error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
