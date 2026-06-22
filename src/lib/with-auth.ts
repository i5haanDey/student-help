import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export type AuthSession = {
  user: {
    id: string
    role?: string
    email: string
    name?: string | null
    image?: string | null
  }
}

export type AuthProfile = {
  id: string
  userId: string
  role: string
  displayName: string
  avatarUrl: string | null
}

export type AuthPayload = {
  session: AuthSession
  profile: AuthProfile
}

export function withAuth(
  handler: (payload: AuthPayload & { req: Request; params: Record<string, string> }) => Promise<NextResponse<unknown>>,
  options?: { role?: string }
): (req: Request, context?: { params: Promise<Record<string, string>> | Record<string, string> }) => Promise<NextResponse<unknown>> {
  return async (req, context) => {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (options?.role && session.user.role !== options.role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const params = context?.params ? await Promise.resolve(context.params) : {}

    return handler({
      session: session as AuthSession,
      profile: { id: profile.id, userId: profile.userId, role: profile.role, displayName: profile.displayName, avatarUrl: profile.avatarUrl },
      req,
      params,
    })
  }
}
