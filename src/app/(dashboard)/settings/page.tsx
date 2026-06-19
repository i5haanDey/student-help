import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Settings - Student Help",
  description: "Manage your account settings and preferences.",
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Account settings and preferences coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Profile editing, notification preferences, and account management will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
