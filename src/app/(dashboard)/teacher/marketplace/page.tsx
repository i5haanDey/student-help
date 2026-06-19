import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MarketplacePlaceholder } from "@/components/dummy/marketplace-placeholder"

export const metadata: Metadata = {
  title: "Marketplace - Student Help",
  description: "Study materials and recorded lectures marketplace. Coming in Phase 2.",
}

export default async function MarketplacePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "teacher") redirect(`/${session.user.role}`)

  return <MarketplacePlaceholder />
}
