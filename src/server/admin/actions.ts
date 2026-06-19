"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function approveTeacher(profileId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: { verificationStatus: "approved" },
  })

  await prisma.notification.create({
    data: {
      userId: profileId,
      title: "Verification Approved",
      body: "Your teacher profile has been approved. You can now accept student sessions.",
      type: "verification",
    },
  })

  revalidatePath("/admin/teachers")
}

export async function rejectTeacher(profileId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: { verificationStatus: "rejected" },
  })

  await prisma.notification.create({
    data: {
      userId: profileId,
      title: "Verification Rejected",
      body: "Your teacher verification was not approved. You may re-apply after 7 days.",
      type: "verification",
    },
  })

  revalidatePath("/admin/teachers")
}
