import { DashboardNav } from "@/components/layout/dashboard-nav"

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Teachers", href: "/admin/teachers" },
  { label: "Users", href: "/admin/users" },
  { label: "Sessions", href: "/admin/sessions" },
  { label: "Disputes", href: "/admin/disputes" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav items={navItems} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
