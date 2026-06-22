"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Brain,
  Sparkles,
  Users,
  Video,
  Zap,
  Star,
  ChevronDown,
  TrendingUp,
  X,
} from "lucide-react"
import { MagneticButton } from "@/components/motion/magnetic-button-awwwards"
import { TextReveal } from "@/components/motion/text-reveal"
import { SmoothScroll } from "@/components/motion/smooth-scroll"

const ease = [0.76, 0, 0.24, 1] as const

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return pos
}

function useWindowSize() {
  const [size, setSize] = useState({ w: 1200, h: 800 })
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return size
}

/* ─── 1. HERO ─── */
const GRADIENT_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#6366f1"]

function HeroSection() {
  const mouse = useMousePosition()
  const { w } = useWindowSize()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200)
    return () => clearTimeout(t)
  }, [])

  const gradX = (mouse.x / w) * 100

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #fff 0.5px, transparent 0.5px)",
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(600px circle at 30% 40%, #6366f1, transparent)",
            "radial-gradient(600px circle at 70% 60%, #8b5cf6, transparent)",
            "radial-gradient(600px circle at 50% 50%, #6366f1, transparent)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-20 flex h-full w-full items-center justify-center px-6">
        <div className="max-w-[90vw] text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            AI-Powered Learning Platform
          </motion.div>

          <h1
            className="relative font-black uppercase leading-[0.85] select-none"
            style={{ fontSize: "clamp(3rem, 12vw, 10rem)", letterSpacing: "-0.04em" }}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${GRADIENT_COLORS.join(", ")})`,
                backgroundSize: "200% 100%",
                backgroundPosition: `${gradX}% 0%`,
              }}
            >
              LEARN
            </span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${GRADIENT_COLORS.join(", ")})`,
                backgroundSize: "200% 100%",
                backgroundPosition: `${100 - gradX}% 0%`,
              }}
            >
              SMARTER.
            </span>
            <br />
            <span className="text-white/10" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.15)" }}>
              NOT HARDER.
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: 0.6 }}
            className="mt-8 flex flex-col items-center gap-6"
          >
            <p className="max-w-lg text-sm text-white/40 leading-relaxed tracking-wide uppercase">
              AI doubt solving &bull; Expert tutors &bull; Mastery tracking
            </p>
            <Link href="/register">
              <MagneticButton>
                Start Learning Free <ArrowRight className="ml-2 h-4 w-4" />
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5 text-white/20" />
      </motion.div>
    </section>
  )
}

/* ─── 2. MARQUEE ─── */
function MarqueeSection() {
  const items = [
    "✦ AI DOUBT SOLVING",
    "✦ EXPERT TUTORS",
    "✦ 24/7 LEARNING",
    "✦ MASTERY TRACKING",
    "✦ LIVE SESSIONS",
    "✦ PRACTICE GENERATOR",
  ]
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#0c0c0c] py-6 -mt-px">
      <div className="flex" style={{ transform: "rotate(-2deg) scale(1.05)" }}>
        <motion.div
          className="flex shrink-0 gap-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-white/10"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── 3. BENTO FEATURES ─── */
const featuresBento = [
  {
    icon: Brain,
    title: "AI Doubt Solver",
    desc: "Upload text or image doubts and get instant AI explanations with confidence scoring.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Sparkles,
    title: "Explain Differently",
    desc: "Five modes — Simple, Visual, Analogy, Step-by-Step, Exam-Oriented.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Users,
    title: "Expert Teachers",
    desc: "Verified educators for personalized 1-on-1 live sessions.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Video,
    title: "Live Classroom",
    desc: "Video sessions with whiteboard, chat, and screen sharing.",
    span: "md:col-span-1 md:row-span-2",
  },
  {
    icon: Zap,
    title: "Practice Generator",
    desc: "Customized practice sets after every session — Easy, Medium, Advanced.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: TrendingUp,
    title: "Mastery Tracking",
    desc: "Track scores per subject with radial charts and recommendations.",
    span: "md:col-span-2 md:row-span-1",
  },
]

function BentoCard({
  feature,
  index,
}: {
  feature: (typeof featuresBento)[number]
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 0, y: 0 })

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return
      const r = cardRef.current.getBoundingClientRect()
      setGlow({ x: e.clientX - r.left, y: e.clientY - r.top })
    },
    [],
  )

  const Icon = feature.icon
  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease, delay: index * 0.08 }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 ${feature.span}`}
    >
      <div
        className="pointer-events-none absolute -inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(500px circle at ${glow.x}px ${glow.y}px, rgba(99,102,241,0.12), transparent)`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
        <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  )
}

function BentoSection() {
  return (
    <section className="relative bg-[#0a0a0a] py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <TextReveal
            text="EVERYTHING YOU NEED"
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white mb-4"
          />
          <p className="text-white/30 text-sm max-w-md uppercase tracking-wider">
            Features designed to make learning effortless.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px] md:auto-rows-[200px]">
          {featuresBento.map((f, i) => (
            <BentoCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 4. AI DEMO SPLIT SCREEN ─── */
function DemoSplitSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] })
  const steps = [
    { label: "Ask a doubt", desc: 'What is the derivative of x²?', color: "#6366f1" },
    { label: "AI analyzes", desc: "Detecting: Calculus / Power Rule", color: "#8b5cf6" },
    { label: "Step-by-step", desc: "d/dx [x²] = 2·x¹ = 2x", color: "#a78bfa" },
    { label: "Confidence", desc: "High — 96% certainty", color: "#22c55e" },
  ]
  const activeStep = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [-0.5, 0, 1, 2, 3])
  const stepOpacity0 = useTransform(activeStep, [-0.5, 0.3], [0.2, 1])
  const stepOpacity1 = useTransform(activeStep, [0.7, 1.3], [0.2, 1])
  const stepOpacity2 = useTransform(activeStep, [1.7, 2.3], [0.2, 1])
  const stepOpacity3 = useTransform(activeStep, [2.7, 3], [0.2, 1])
  const mockOpacity0 = useTransform(activeStep, [-0.5, 0.3], [0, 1])
  const mockOpacity2 = useTransform(activeStep, [1.7, 2.3], [0, 1])
  const mockOpacity3 = useTransform(activeStep, [2.7, 3], [0, 1])
  const stepOpacities = [stepOpacity0, stepOpacity1, stepOpacity2, stepOpacity3]

  return (
    <section ref={containerRef} className="relative bg-[#0a0a0a] min-h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full">
          {/* Left — pinned text */}
          <div className="flex items-center justify-center px-8 lg:px-16">
            <div>
              <TextReveal
                text="AI DOUBT SOLVER"
                className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white mb-6"
              />
              <p className="text-white/30 text-sm leading-relaxed max-w-md uppercase tracking-wider">
                Type a question or snap a picture. Our AI explains it in five different ways — Simple, Visual, Analogy, Step-by-Step, or Exam-Oriented.
              </p>
              <div className="mt-8 space-y-4">
                {steps.map((s, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0.2 }}
                    style={{ opacity: stepOpacities[i] }}
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: s.color + "33", color: s.color, border: `1px solid ${s.color}44` }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{s.label}</div>
                      <div className="text-xs text-white/40">{s.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          {/* Right — mock UI */}
          <div className="flex items-center justify-center px-8 lg:px-16">
            <motion.div
              className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">AI Doubt Solver</div>
                  <div className="text-[11px] text-white/30">High Confidence</div>
                </div>
              </div>
              <div className="space-y-4">
                <motion.div
                  className="rounded-2xl bg-white/[0.04] border border-white/5 p-4"
                  initial={{ opacity: 0 }}
                  style={{ opacity: mockOpacity0 }}
                >
                  <p className="text-sm text-white/60">
                    <span className="text-white font-medium">Q:</span> What is the derivative of x²?
                  </p>
                </motion.div>
                <motion.div
                  className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  style={{ opacity: mockOpacity2 }}
                >
                  <p className="text-sm text-white/80">
                    The derivative of <span className="text-indigo-400 font-mono">x²</span> is{" "}
                    <span className="text-indigo-400 font-mono font-bold">2x</span>.
                    Power rule: <span className="font-mono">d/dx [xⁿ] = n·xⁿ⁻¹</span>.
                    Here n=2, so 2·x¹ = 2x.
                  </p>
                </motion.div>
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0 }}
                  style={{ opacity: mockOpacity3 }}
                >
                  {["Simple", "Analogy", "Visual", "Step-by-Step", "Exam"].map((m) => (
                    <span
                      key={m}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-white/40"
                    >
                      {m}
                    </span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── 5. HORIZONTAL TEACHERS ROSTER ─── */
const teachers = [
  { name: "Sarah Kapoor", subject: "Mathematics", rate: "₹500/hr", rating: 4.9, initials: "SK", color: "#6366f1" },
  { name: "Rohan Mehta", subject: "Physics", rate: "₹600/hr", rating: 4.8, initials: "RM", color: "#8b5cf6" },
  { name: "Priya Sharma", subject: "Chemistry", rate: "₹450/hr", rating: 4.9, initials: "PS", color: "#a78bfa" },
  { name: "Arun Kumar", subject: "Biology", rate: "₹550/hr", rating: 4.7, initials: "AK", color: "#c084fc" },
  { name: "Neha Gupta", subject: "English", rate: "₹400/hr", rating: 4.9, initials: "NG", color: "#818cf8" },
  { name: "Vikram Singh", subject: "History", rate: "₹350/hr", rating: 4.6, initials: "VS", color: "#6366f1" },
]

function HorizontalRoster() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] })
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"])

  return (
    <section ref={containerRef} className="relative bg-[#0a0a0a] py-32 overflow-hidden">
      <div className="mb-16 px-6">
        <TextReveal
          text="EXPERT TEACHERS"
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white mb-4"
        />
        <p className="text-white/30 text-sm max-w-md uppercase tracking-wider px-6">
          Learn from the best. Verified educators ready to help.
        </p>
      </div>
      <div className="relative h-[400px]">
        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        <motion.div className="flex gap-6 px-6 absolute left-0 top-0 h-full items-center" style={{ x }}>
          {[...teachers, ...teachers].map((t, i) => (
            <motion.div
              key={`${t.name}-${i}`}
              className="group relative w-[280px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 hover:bg-white/[0.08] transition-colors duration-300"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: t.color + "33", border: `1px solid ${t.color}44` }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.subject}</div>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" /> {t.rating}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/5 p-3">
                <span className="text-xs text-white/40">Rate</span>
                <span className="text-sm font-bold text-white">{t.rate}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── 6. MASTERY VISUALIZATION ─── */
function MasteryVizSection() {
  const subjects = [
    { name: "Algebra", score: 85 },
    { name: "Calculus", score: 62 },
    { name: "Geometry", score: 78 },
    { name: "Physics", score: 71 },
    { name: "Chemistry", score: 45 },
  ]

  return (
    <section className="relative bg-[#060606] py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <TextReveal
            text="MASTERY ANALYTICS"
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white mb-4"
          />
          <p className="text-white/30 text-sm max-w-md uppercase tracking-wider">
            Track your progress across every subject.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Ring chart */}
          <div className="flex justify-center">
            <svg viewBox="0 0 200 200" className="w-64 h-64 md:w-80 md:h-80">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              {subjects.map((s, i) => {
                const circumference = 2 * Math.PI * 80
                const offset = circumference - (s.score / 100) * circumference
                const rotation = (i * 72) - 90
                const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c084fc", "#818cf8"]
                return (
                  <motion.circle
                    key={s.name}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={colors[i]}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    whileInView={{ strokeDashoffset: offset }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease, delay: i * 0.15 }}
                    transform={`rotate(${rotation} 100 100)`}
                    strokeLinecap="round"
                  />
                )
              })}
              <motion.text
                x="100" y="95" textAnchor="middle"
                className="text-4xl font-black fill-white"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.8 }}
              >
                68%
              </motion.text>
              <motion.text
                x="100" y="115" textAnchor="middle"
                className="text-[8px] fill-white/30 uppercase tracking-widest"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 1 }}
              >
                Overall
              </motion.text>
            </svg>
          </div>
          {/* Subject bars */}
          <div className="space-y-5">
            {subjects.map((s, i) => (
              <div key={s.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">{s.name}</span>
                  <span className="text-white font-bold">{s.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: ["#6366f1", "#8b5cf6", "#a78bfa", "#c084fc", "#818cf8"][i] }}
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${s.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease, delay: i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── 7. FAQ ACCORDION ─── */
const faqs = [
  { q: "How does the AI doubt solver work?", a: "Type or upload an image of your doubt. Our AI analyzes it and provides a detailed explanation with confidence scoring. You can choose from 5 explain modes for the same answer." },
  { q: "Are the teachers verified?", a: "Yes. All teachers go through a strict verification process including ID checks, credential validation, and a demo session before they can start teaching." },
  { q: "How do live sessions work?", a: "Book a slot with any verified teacher. You'll get a LiveKit-powered video room with whiteboard, chat, and screen sharing. Sessions are recorded for later review." },
  { q: "What is mastery tracking?", a: "After each session and practice set, your scores are updated per subject. Visual charts show your progress and highlight areas needing improvement." },
  { q: "Is there a free tier?", a: "Yes. AI doubt solving is free. Live sessions with teachers are paid — you only pay for the time you book." },
]

function AccordionSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative bg-[#0a0a0a] py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <TextReveal
            text="QUESTIONS?"
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white mb-4 justify-center"
          />
          <p className="text-white/30 text-sm uppercase tracking-wider">
            Everything you need to know.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              layout
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <X className="h-4 w-4 text-white/30" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <div className="px-5 pb-5">
                      <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 8. MEGA FOOTER ─── */
function MegaFooter() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const mouse = useMousePosition()
  const linkItems = [
    { label: "Features", href: "#" },
    { label: "Teachers", href: "/register" },
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ]

  return (
    <footer className="relative bg-[#060606] overflow-hidden" style={{ minHeight: "80vh" }}>
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[80vh] p-8 md:p-16">
        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-xl">
          {linkItems.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onMouseEnter={() => setHoveredLink(link.label)}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative text-sm text-white/30 hover:text-white transition-colors duration-300 uppercase tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16">
          <Link href="/register">
            <MagneticButton>
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButton>
          </Link>
          <div className="mt-4 flex items-center gap-4 text-xs text-white/20">
            <span>&copy; 2026 Student Help</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>All rights reserved</span>
          </div>
        </div>
      </div>

      {/* Floating image on hover */}
      {hoveredLink && (
        <motion.div
          className="pointer-events-none fixed z-20"
          style={{ left: mouse.x + 20, top: mouse.y - 60 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl px-4 py-2">
            <span className="text-xs text-white/60">{hoveredLink}</span>
          </div>
        </motion.div>
      )}

      {/* Giant brand text */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none select-none z-0"
        style={{ lineHeight: 0.7 }}
      >
        <span
          className="font-black uppercase text-white/[0.02]"
          style={{ fontSize: "clamp(4rem, 25vw, 18rem)", letterSpacing: "-0.05em" }}
        >
          STUDENT
          <br />
          HELP
        </span>
      </div>
    </footer>
  )
}

/* ─── ASSEMBLE ─── */
export default function HomePage() {
  return (
    <SmoothScroll>
    <div className="bg-[#0a0a0a]">
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest">
            <BookOpen className="h-4 w-4" />
            <span>Student<span className="text-indigo-400">Help</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-xs text-white/40 uppercase tracking-widest">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Get Started</Link>
          </nav>
        </div>
      </header>

      <HeroSection />
      <MarqueeSection />
      <BentoSection />
      <DemoSplitSection />
      <HorizontalRoster />
      <MasteryVizSection />
      <AccordionSection />
      <MegaFooter />
    </div>
    </SmoothScroll>
  )
}
