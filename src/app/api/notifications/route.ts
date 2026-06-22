import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { withAuth } from "@/lib/with-auth"

export const GET = withAuth(async ({ profile }) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(notifications)
})

export const PATCH = withAuth(async ({ profile }) => {
  await prisma.notification.updateMany({
    where: { userId: profile.id, isRead: false },
    data: { isRead: true },
  })

  return NextResponse.json({ success: true })
})
