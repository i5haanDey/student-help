import { DashboardNav } from "@/components/layout/dashboard-nav"

const navItems = [
  { label: "Dashboard", href: "/student" },
  { label: "Ask AI", href: "/student/ask" },
  { label: "Teachers", href: "/student/teachers" },
  { label: "Forum", href: "/student/forum" },
  { label: "Sessions", href: "/student/sessions" },
  { label: "Practice", href: "/student/practice" },
  { label: "Mastery", href: "/student/mastery" },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav items={navItems} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
