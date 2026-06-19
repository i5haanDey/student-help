"use client"

import { useState, useMemo, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Search, X } from "lucide-react"
import { toast } from "sonner"

const GRADE_LEVELS = [
  "6th", "7th", "8th", "9th", "10th", "11th", "12th",
  "Undergraduate", "Graduate", "Other",
]

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "History", "Geography",
  "Economics", "Accountancy", "Hindi", "Sanskrit",
]

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Other"]

const LANGUAGE_FLAGS: Record<string, string> = {
  English: "🇬🇧",
  Hindi: "🇮🇳",
  Tamil: "🇮🇳",
  Telugu: "🇮🇳",
  Kannada: "🇮🇳",
  Malayalam: "🇮🇳",
  Marathi: "🇮🇳",
  Gujarati: "🇮🇳",
  Bengali: "🇮🇳",
  Other: "🌐",
}

const EXAM_GROUP_CHILDREN: Record<string, string[]> = {
  "State Boards": [
    "Maharashtra Board", "UP Board", "Bihar Board", "Rajasthan Board",
    "MP Board", "Gujarat Board", "Karnataka Board (PUC)", "Tamil Nadu Board",
    "West Bengal Board", "AP Board", "Telangana Board", "Odisha Board",
    "Kerala Board", "Punjab Board", "Haryana Board", "Assam Board",
    "Jharkhand Board", "Chhattisgarh Board", "Uttarakhand Board", "J&K Board",
  ],
  "State Engineering Exams": [
    "MHT CET", "KCET", "WBJEE", "AP EAMCET", "TS EAMCET",
    "KEAM", "GUJCET", "COMEDK UGET",
    "CG PET", "BCECE", "UKSEE", "JKCET",
  ],
  "Private University Exams": [
    "VITEEE", "SRMJEEE", "MET", "BITSAT", "CUSAT CAT",
    "LPUNEST", "IPU CET", "AMUEEE",
  ],
}

type ExamGroup = { group: string }
type ExamItem = string | ExamGroup

type ExamCategory = {
  label: string
  items: ExamItem[]
}

const EXAM_CATEGORIES_BY_GRADE: Record<string, ExamCategory[]> = {
  "6th": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NCO", "NTSE"],
    },
    { label: "Other", items: ["Other"] },
  ],
  "7th": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NCO", "NTSE"],
    },
    { label: "Other", items: ["Other"] },
  ],
  "8th": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NCO", "NTSE", "KVPY"],
    },
    { label: "Other", items: ["Other"] },
  ],
  "9th": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NTSE", "KVPY", "PRMO", "NSEP", "NSEB"],
    },
    { label: "Other", items: ["Other"] },
  ],
  "10th": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NTSE", "KVPY", "PRMO", "NSEB"],
    },
    {
      label: "Study Abroad",
      items: ["SAT"],
    },
    { label: "Other", items: ["Other"] },
  ],
  "11th": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    { label: "Medical", items: ["NEET UG"] },
    { label: "Commerce", items: ["CA Foundation", "CS Foundation"] },
    { label: "University Entrance", items: ["CUET UG", "IPMAT"] },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NTSE", "KVPY", "PRMO", "NSEP", "NSEB"],
    },
    { label: "Defence", items: ["NDA"] },
    { label: "Design", items: ["NIFT", "NID"] },
    { label: "Study Abroad", items: ["SAT", "IELTS"] },
    { label: "Other", items: ["Other"] },
  ],
  "12th": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    { label: "Medical", items: ["NEET UG"] },
    { label: "Law", items: ["CLAT", "AILET", "LSAT India"] },
    { label: "Commerce", items: ["CA Foundation", "CS Foundation"] },
    { label: "University Entrance", items: ["CUET UG", "IPMAT", "NPAT", "SET"] },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NTSE", "KVPY", "PRMO"],
    },
    { label: "Defence", items: ["NDA", "CDS"] },
    { label: "Design", items: ["NIFT", "NID", "UCEED"] },
    { label: "Study Abroad", items: ["SAT", "IELTS", "TOEFL"] },
    { label: "Other", items: ["Other"] },
  ],
  "Undergraduate": [
    { label: "University Entrance", items: ["CUET UG", "IPMAT", "NPAT", "SET"] },
    { label: "Civil Services", items: ["UPSC CSE", "State PCS", "SSC CGL", "CDS"] },
    { label: "Law", items: ["CLAT", "AILET", "LSAT India"] },
    { label: "Study Abroad", items: ["IELTS", "TOEFL", "SAT"] },
    { label: "Postgrad", items: ["GATE", "IIT JAM", "CAT", "XAT", "NMAT", "SNAP"] },
    { label: "Other", items: ["Other"] },
  ],
  "Graduate": [
    { label: "Postgrad", items: ["GATE", "IIT JAM", "UGC NET", "CSIR NET", "CAT", "XAT", "NMAT", "SNAP"] },
    { label: "Civil Services", items: ["UPSC CSE", "State PCS", "SSC CGL"] },
    { label: "Study Abroad", items: ["IELTS", "TOEFL", "GRE", "GMAT", "PTE"] },
    { label: "Other", items: ["Other"] },
  ],
  "Other": [
    {
      label: "Board Exams",
      items: ["CBSE Board", "ICSE Board", "IB Board", "Cambridge IGCSE", { group: "State Boards" }],
    },
    {
      label: "Engineering",
      items: ["JEE Main", "JEE Advanced", { group: "State Engineering Exams" }, { group: "Private University Exams" }],
    },
    { label: "Medical", items: ["NEET UG"] },
    { label: "Law", items: ["CLAT", "AILET", "LSAT India"] },
    { label: "Commerce", items: ["CA Foundation", "CS Foundation", "CMA"] },
    { label: "University Entrance", items: ["CUET UG", "IPMAT", "NPAT", "SET"] },
    { label: "Civil Services", items: ["UPSC CSE", "State PCS", "SSC CGL", "CDS"] },
    { label: "Defence", items: ["NDA", "AFCAT"] },
    { label: "Design", items: ["NIFT", "NID", "UCEED"] },
    { label: "Study Abroad", items: ["IELTS", "TOEFL", "SAT", "ACT", "GRE", "GMAT", "PTE", "Duolingo"] },
    { label: "Postgrad", items: ["GATE", "IIT JAM", "UGC NET", "CSIR NET", "CAT", "XAT", "NMAT", "SNAP"] },
    {
      label: "Olympiad",
      items: ["NSO", "IMO", "NCO", "NTSE", "KVPY", "PRMO", "RMO", "INMO", "NSEP", "NSEA", "NSEB"],
    },
    { label: "Other", items: ["Other"] },
  ],
}

const ALWAYS_SHOW_CATEGORIES = new Set(["Board Exams", "Other"])

const EXAM_SUBJECT_MAP: Record<string, string[]> = {
  // Engineering
  "JEE Main": ["Mathematics", "Physics", "Chemistry"],
  "JEE Advanced": ["Mathematics", "Physics", "Chemistry"],
  BITSAT: ["Mathematics", "Physics", "Chemistry"],
  "MHT CET": ["Mathematics", "Physics", "Chemistry"],
  KCET: ["Mathematics", "Physics", "Chemistry"],
  WBJEE: ["Mathematics", "Physics", "Chemistry"],
  "AP EAMCET": ["Mathematics", "Physics", "Chemistry"],
  "TS EAMCET": ["Mathematics", "Physics", "Chemistry"],
  KEAM: ["Mathematics", "Physics", "Chemistry"],
  GUJCET: ["Mathematics", "Physics", "Chemistry"],
  "COMEDK UGET": ["Mathematics", "Physics", "Chemistry"],
  "CG PET": ["Mathematics", "Physics", "Chemistry"],
  BCECE: ["Mathematics", "Physics", "Chemistry"],
  UKSEE: ["Mathematics", "Physics", "Chemistry"],
  JKCET: ["Mathematics", "Physics", "Chemistry"],
  VITEEE: ["Mathematics", "Physics", "Chemistry"],
  SRMJEEE: ["Mathematics", "Physics", "Chemistry"],
  MET: ["Mathematics", "Physics", "Chemistry"],
  "CUSAT CAT": ["Mathematics", "Physics", "Chemistry"],
  LPUNEST: ["Mathematics", "Physics", "Chemistry"],
  "IPU CET": ["Mathematics", "Physics", "Chemistry"],
  AMUEEE: ["Mathematics", "Physics", "Chemistry"],
  // Medical
  "NEET UG": ["Physics", "Chemistry", "Biology"],
  // Commerce
  "CA Foundation": ["Accountancy", "Economics"],
  "CS Foundation": ["Accountancy", "Economics"],
  CMA: ["Accountancy", "Economics"],
  // Law
  CLAT: ["English"],
  AILET: ["English"],
  "LSAT India": ["English"],
  // University Entrance
  CUET: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Economics", "Accountancy", "Computer Science", "Hindi", "Sanskrit"],
  "CUET UG": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Economics", "Accountancy", "Computer Science", "Hindi", "Sanskrit"],
  IPMAT: ["Mathematics", "English"],
  NPAT: ["Mathematics", "English"],
  SET: ["Mathematics", "English"],
  // Defence
  NDA: ["Mathematics", "English"],
  CDS: ["English"],
  AFCAT: ["English"],
  // Design
  UCEED: ["Mathematics", "Computer Science"],
  NIFT: [],
  NID: [],
  // Study Abroad
  SAT: ["Mathematics", "English"],
  ACT: ["Mathematics", "English"],
  IELTS: ["English"],
  TOEFL: ["English"],
  GRE: ["English"],
  GMAT: ["Mathematics", "English"],
  PTE: ["English"],
  Duolingo: ["English"],
  // Civil Services
  "UPSC CSE": ["History", "Geography", "Economics", "English"],
  "State PCS": ["History", "Geography"],
  "SSC CGL": ["Mathematics", "English"],
  // Postgrad
  GATE: ["Mathematics", "Computer Science", "Physics"],
  "IIT JAM": ["Mathematics", "Physics", "Chemistry", "Biology"],
  "UGC NET": ["English", "History", "Geography", "Economics", "Computer Science", "Hindi", "Sanskrit"],
  "CSIR NET": ["Mathematics", "Physics", "Chemistry", "Biology"],
  CAT: ["Mathematics", "English"],
  XAT: ["Mathematics", "English"],
  NMAT: ["Mathematics", "English"],
  SNAP: ["Mathematics", "English"],
  // Olympiad
  NSO: ["Biology"],
  IMO: ["Mathematics"],
  NCO: ["Computer Science"],
  NTSE: ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "Economics"],
  KVPY: ["Mathematics", "Physics", "Chemistry", "Biology"],
  PRMO: ["Mathematics"],
  RMO: ["Mathematics"],
  INMO: ["Mathematics"],
  NSEP: ["Physics"],
  NSEA: ["Mathematics", "Physics"],
  NSEB: ["Biology"],
}

const steps = ["Personal Info", "Subjects", "Preferences"]

function getAllExamTargets(grade: string): string[] {
  const categories = EXAM_CATEGORIES_BY_GRADE[grade] ?? []
  const targets: string[] = []
  for (const cat of categories) {
    for (const item of cat.items) {
      if (typeof item === "string") {
        targets.push(item)
      } else {
        const children = EXAM_GROUP_CHILDREN[item.group]
        if (children) targets.push(...children)
      }
    }
  }
  return targets
}

export function StudentOnboarding() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    displayName: "",
    gradeLevel: "",
    subjects: [] as string[],
    examTargets: [] as string[],
    preferredLanguages: [] as string[],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const validTargets = useMemo<Set<string> | null>(() => {
    if (form.subjects.length === 0) return null
    const categories = EXAM_CATEGORIES_BY_GRADE[form.gradeLevel] ?? []
    const valid = new Set<string>()
    for (const category of categories) {
      if (ALWAYS_SHOW_CATEGORIES.has(category.label)) continue
      for (const item of category.items) {
        if (typeof item === "string") {
          const required = EXAM_SUBJECT_MAP[item]
          if (!required || required.some((s) => form.subjects.includes(s))) valid.add(item)
        } else {
          const children = EXAM_GROUP_CHILDREN[item.group] ?? []
          for (const child of children) {
            const required = EXAM_SUBJECT_MAP[child]
            if (!required || required.some((s) => form.subjects.includes(s))) valid.add(child)
          }
        }
      }
    }
    return valid
  }, [form.gradeLevel, form.subjects])

  const filteredCategories = useMemo(() => {
    const categories = EXAM_CATEGORIES_BY_GRADE[form.gradeLevel] ?? []
    if (form.subjects.length === 0) return categories
    if (!validTargets) return categories

    return categories
      .map((cat) => {
        if (ALWAYS_SHOW_CATEGORIES.has(cat.label)) return cat
        const filteredItems = cat.items.filter((item) => {
          if (typeof item === "string") return validTargets.has(item)
          const children = EXAM_GROUP_CHILDREN[item.group] ?? []
          return children.some((c) => validTargets.has(c))
        })
        return { ...cat, items: filteredItems }
      })
      .filter((cat) => cat.items.length > 0)
  }, [form.gradeLevel, form.subjects, validTargets])

  function handleGradeChange(g: string) {
    setForm((f) => {
      const valid = new Set(getAllExamTargets(g))
      return {
        ...f,
        gradeLevel: g,
        examTargets: f.examTargets.filter((t) => valid.has(t)),
      }
    })
    setExpandedGroups(new Set())
  }

  function toggleGroup(group: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  function toggleCategory(label: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  function toggleSubject(s: string) {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s],
    }))
  }

  function toggleExamTarget(t: string) {
    setForm((f) => ({
      ...f,
      examTargets: f.examTargets.includes(t) ? f.examTargets.filter((x) => x !== t) : [...f.examTargets, t],
    }))
  }

  function toggleLanguage(l: string) {
    setForm((f) => ({
      ...f,
      preferredLanguages: f.preferredLanguages.includes(l)
        ? f.preferredLanguages.filter((x) => x !== l)
        : [...f.preferredLanguages, l],
    }))
  }

  async function handleComplete() {
    setIsLoading(true)

    try {
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? "Failed to save profile")
        return
      }

      await update()
      router.push("/student")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 0) return form.displayName.length > 0 && form.gradeLevel.length > 0
    if (step === 1) return form.subjects.length > 0
    return true
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <CardTitle className="text-2xl">Set Up Your Profile</CardTitle>
        <CardDescription>
          {step === 0 && "Tell us about yourself"}
          {step === 1 && "What subjects do you study?"}
          {step === 2 && "Any exam targets or language preferences?"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Grade / Education Level</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {GRADE_LEVELS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGradeChange(g)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      form.gradeLevel === g
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <Label>Select your subjects</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <Badge
                  key={s}
                  variant={form.subjects.includes(s) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-1.5 px-3"
                  onClick={() => toggleSubject(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Selected Chips Bar */}
            {form.examTargets.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-muted/30 rounded-lg border">
                <span className="text-xs text-muted-foreground font-medium mr-0.5">
                  {form.examTargets.length} selected:
                </span>
                <AnimatePresence>
                  {form.examTargets.map((target) => (
                    <motion.span
                      key={target}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => toggleExamTarget(target)}
                    >
                      {target}
                      <X className="h-3 w-3" />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Exam Targets */}
            <div className="space-y-2">
              <Label>Exam Targets (optional)</Label>
              {!form.gradeLevel && (
                <p className="text-sm text-muted-foreground">Select a grade first to see relevant exam targets.</p>
              )}
              {filteredCategories.length === 0 && form.gradeLevel && (
                <p className="text-sm text-muted-foreground">
                  Select subjects in the previous step to see relevant exam targets.
                </p>
              )}
              <motion.div layout className="space-y-1.5">
                {filteredCategories.map((category) => {
                  const alwaysShow = ALWAYS_SHOW_CATEGORIES.has(category.label)
                  const selectedInCategory = form.examTargets.filter((t) =>
                    category.items.some((item) => {
                      if (typeof item === "string") return item === t
                      const children = EXAM_GROUP_CHILDREN[(item as ExamGroup).group] ?? []
                      return children.includes(t)
                    })
                  )
                  const isCollapsed = collapsedCategories.has(category.label)
                  return (
                    <motion.div
                      key={category.label}
                      layout
                      className="rounded-lg border bg-card/50 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.label)}
                        className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                            {category.label}
                          </span>
                          <span className="text-xs text-muted-foreground/70">
                            {category.items.length}
                          </span>
                          {selectedInCategory.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] bg-primary text-primary-foreground rounded-full font-medium px-1">
                              {selectedInCategory.length}
                            </span>
                          )}
                        </div>
                        <motion.div
                          animate={{ rotate: isCollapsed ? -90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3">
                              <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                  const items = category.items.filter((item) => {
                                    if (!searchQuery) return true
                                    const q = searchQuery.toLowerCase()
                                    if (typeof item === "string") return item.toLowerCase().includes(q)
                                    const children = EXAM_GROUP_CHILDREN[(item as ExamGroup).group] ?? []
                                    return children.some((c) => c.toLowerCase().includes(q))
                                  })
                                  if (items.length === 0) {
                                    return (
                                      <p className="text-xs text-muted-foreground py-1 w-full text-center">
                                        No exams match &quot;{searchQuery}&quot;
                                      </p>
                                    )
                                  }
                                  return items.map((item) => {
                                    if (typeof item === "object" && "group" in item) {
                                      const group = item.group
                                      const children = EXAM_GROUP_CHILDREN[group] ?? []
                                      const visibleChildren = alwaysShow ? children : children.filter((c) => !validTargets || validTargets.has(c))
                                      const isExpanded = expandedGroups.has(group)
                                      return (
                                        <Fragment key={group}>
                                          <button
                                            type="button"
                                            onClick={() => toggleGroup(group)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary px-2.5 py-1 rounded-md border border-dashed transition-colors select-none"
                                          >
                                            {isExpanded ? (
                                              <ChevronDown className="h-3 w-3" />
                                            ) : (
                                              <ChevronRight className="h-3 w-3" />
                                            )}
                                            {group}
                                          </button>
                                          <AnimatePresence>
                                            {isExpanded && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="w-full flex flex-wrap gap-1.5"
                                              >
                                                {visibleChildren.map((child) => (
                                                  <motion.button
                                                    key={child}
                                                    type="button"
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.12 }}
                                                    onClick={() => toggleExamTarget(child)}
                                                    className={`text-xs px-2.5 py-1 rounded-full border transition-all select-none ${
                                                      form.examTargets.includes(child)
                                                        ? "bg-primary text-primary-foreground border-primary font-medium"
                                                        : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent"
                                                    }`}
                                                  >
                                                    {child}
                                                  </motion.button>
                                                ))}
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </Fragment>
                                      )
                                    }
                                    const exam = item as string
                                    return (
                                      <motion.button
                                        key={exam}
                                        type="button"
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleExamTarget(exam)}
                                        className={`text-xs px-2.5 py-1 rounded-full border transition-all select-none ${
                                          form.examTargets.includes(exam)
                                            ? "bg-primary text-primary-foreground border-primary font-medium"
                                            : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent"
                                        }`}
                                      >
                                        {exam}
                                      </motion.button>
                                    )
                                  })
                                })()}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* Preferred Languages */}
            <div className="space-y-2">
              <Label>Preferred Languages (optional)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLanguage(l)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${
                      form.preferredLanguages.includes(l)
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <span className="text-base leading-none">{LANGUAGE_FLAGS[l]}</span>
                    <span>{l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Setup"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
