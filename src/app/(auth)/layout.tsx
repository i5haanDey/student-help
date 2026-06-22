import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/4 via-primary/3 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-secondary/4 via-secondary/3 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <header className="relative z-10 sticky top-0 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm shadow-primary/15 transition-all duration-300 group-hover:shadow-md group-hover:shadow-primary/25">
              <BookOpen className="h-[18px] w-[18px]" />
            </div>
            <span className="tracking-tight">Student<span className="text-primary">Help</span></span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center relative z-10 py-8">
        {children}
      </main>
    </div>
  )
}
