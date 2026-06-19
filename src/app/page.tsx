"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Brain, Sparkles, Users, Video, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

function BackgroundShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-secondary/10 via-secondary/5 to-transparent blur-3xl" />
      <div className="absolute top-1/3 left-1/4 h-[200px] w-[200px] rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute top-1/2 right-1/3 h-[150px] w-[150px] rounded-full bg-secondary/5 blur-2xl" />

      <svg className="absolute top-20 right-[15%] h-16 w-16 text-primary/5" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-40 left-[10%] h-20 w-20 text-secondary/5" viewBox="0 0 100 100" fill="none">
        <rect x="10" y="10" width="80" height="80" rx="8" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute top-1/3 right-[10%] h-12 w-12 text-primary/5" viewBox="0 0 100 100" fill="none">
        <polygon points="50,5 95,35 77,90 23,90 5,35" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-1/3 left-[20%] h-10 w-10 text-secondary/5" viewBox="0 0 100 100" fill="none">
        <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute top-1/4 left-[30%] h-8 w-8 text-primary/5" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 6" />
      </svg>
    </div>
  )
}

function DotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
      style={{
        backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  )
}

export default function HomePage() {
  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Student<span className="text-primary">Help</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="transition-colors hover:text-primary">Features</Link>
            <Link href="#how-it-works" className="transition-colors hover:text-primary">How It Works</Link>
            <Link href="#teachers" className="transition-colors hover:text-primary">For Teachers</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="hidden sm:flex">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-24 md:py-40">
          <DotGrid />
          <BackgroundShapes />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

          <div className="relative container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-sm">
                <Sparkles className="h-4 w-4" />
                AI-Powered Learning Platform
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                Learn Smarter,{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                  Not Harder
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Get instant AI doubt solving, connect with expert teachers for live sessions,
                and track your mastery — all in one seamless platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                    Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5">
                    See How It Works
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground pt-6">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                  </span>
                  Instant AI Help
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </span>
                  Expert Teachers
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                  </span>
                  Mastery Tracking
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute inset-0 bg-muted/30" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-0 left-0 h-[200px] w-[200px] rounded-full bg-secondary/5 blur-3xl" />

          <div className="relative container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary tracking-wide uppercase">
                Features
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything You Need to Excel</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From instant doubt solving to live teacher sessions, we&apos;ve got your learning journey covered.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-primary/[0.02] transition-all duration-300 group-hover:bg-primary/[0.05]" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary mb-4 ring-1 ring-primary/10 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
          <DotGrid />
          <div className="absolute top-1/2 left-0 h-[400px] w-[400px] rounded-full bg-primary/[0.02] blur-3xl" />
          <div className="absolute top-1/3 right-0 h-[300px] w-[300px] rounded-full bg-secondary/[0.02] blur-3xl" />

          <div className="relative container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-medium text-secondary tracking-wide uppercase">
                How It Works
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Your Learning Journey</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Five simple steps from doubt to mastery.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center text-center p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg mb-4 shadow-lg shadow-primary/20 relative">
                    {i + 1}
                    {i < 4 && (
                      <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 w-[calc(100%-3rem)] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                    )}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary mb-3">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
            <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary/[0.03] blur-3xl" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="relative container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-primary/20">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to Transform Your Learning?</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of students who are learning smarter with AI-powered doubt solving and expert teacher guidance.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>&copy; 2026 Student Help. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  { icon: Brain, title: "AI Doubt Solver", description: "Upload text or image doubts and get instant AI-powered explanations with confidence labeling." },
  { icon: Sparkles, title: "Explain Differently", description: "Get explanations in 5 modes: Simple, Visual, Analogy, Step-by-Step, or Exam-Oriented." },
  { icon: Users, title: "Expert Teachers", description: "Connect with verified teachers for personalized 1-on-1 live sessions." },
  { icon: Video, title: "Live Classroom", description: "Interactive video sessions with whiteboard, chat, and screen sharing." },
  { icon: Brain, title: "AI Practice Generator", description: "Get customized practice sets after every session — Easy, Medium, and Advanced." },
  { icon: Zap, title: "Mastery Tracking", description: "Track your subject mastery scores and get personalized recommendations." },
]

const steps = [
  { icon: Brain, title: "Upload Doubt", description: "Type or snap a picture of your question" },
  { icon: Sparkles, title: "AI Assistance", description: "Get instant AI explanation with confidence score" },
  { icon: Users, title: "Teacher Session", description: "Book a live session if you need more help" },
  { icon: Zap, title: "AI Practice", description: "Practice with AI-generated questions" },
  { icon: Brain, title: "Track Mastery", description: "Monitor your progress and mastery scores" },
]
