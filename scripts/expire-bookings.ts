import { prisma } from "@/lib/db"

async function main() {
  console.log("[expire-bookings] Starting...")

  const now = new Date()

  const expired = await prisma.booking.findMany({
    where: {
      startsAt: { not: null, lte: now },
      status: "confirmed",
    },
    select: { id: true, startsAt: true, durationMinutes: true },
  })

  const toExpire = expired.filter((b) => {
    if (!b.startsAt) return false
    const endTime = new Date(b.startsAt.getTime() + b.durationMinutes * 60000)
    return endTime < now
  })

  if (toExpire.length === 0) {
    console.log("[expire-bookings] No expired bookings found.")
    return
  }

  await prisma.booking.updateMany({
    where: { id: { in: toExpire.map((b) => b.id) } },
    data: { status: "completed", endedAt: now },
  })

  console.log(`[expire-bookings] Expired ${toExpire.length} booking(s).`)
}

main()
  .catch((e) => {
    console.error("[expire-bookings] Failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
