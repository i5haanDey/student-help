import { DashboardNav } from "@/components/layout/dashboard-nav"

const navItems = [
  { label: "Dashboard", href: "/teacher" },
  { label: "Schedule", href: "/teacher/schedule" },
  { label: "Verification", href: "/teacher/verification" },
  { label: "Sessions", href: "/teacher/sessions" },
  { label: "Earnings", href: "/teacher/earnings" },
  { label: "Marketplace", href: "/teacher/marketplace" },
  { label: "Profile", href: "/teacher/profile" },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav items={navItems} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
