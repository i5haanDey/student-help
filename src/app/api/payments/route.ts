import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"
import { PaymentCreateSchema } from "@/lib/validators"

export const POST = withAuth(async ({ req }) => {
  try {
    const { bookingId } = PaymentCreateSchema.parse(await req.json())

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { displayName: true } },
        teacher: { select: { id: true, displayName: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const roomName = `room_${bookingId}`

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentId: mockPaymentId,
          status: "confirmed",
          roomUrl: `${process.env.LIVEKIT_URL ?? ""}/room/${roomName}`,
        },
      }),
      prisma.liveSession.create({
        data: {
          bookingId,
          roomName,
          aiSummaryStatus: "pending",
        },
      }),
      prisma.notification.create({
        data: {
          userId: booking.teacher.id,
          title: "Payment Received",
          body: `Payment of ₹${Number(booking.amountInr).toLocaleString()} confirmed for session with ${booking.student.displayName}.`,
          type: "payment",
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      paymentId: mockPaymentId,
      amountInr: Number(booking.amountInr),
    })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
