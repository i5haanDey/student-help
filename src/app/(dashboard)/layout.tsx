import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BackToTop } from "@/components/layout/back-to-top"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <>
      {children}
      <BackToTop />
    </>
  )
}
