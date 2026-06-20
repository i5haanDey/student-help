"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Star, BookOpen, IndianRupee, Filter, X } from "lucide-react"
import Link from "next/link"

const SUBJECTS = [
  "All", "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "History", "Geography", "Economics",
]

interface Teacher {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  subjects: string[]
  teachingLanguages: string[]
  hourlyRateInr: number | null
  compositeScore: number
  totalSessions: number
  isAvailableNow: boolean
  rank: string
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function TeacherSearch() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [subject, setSubject] = useState("All")
  const [maxRate, setMaxRate] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const hasActiveFilters = subject !== "All" || maxRate || availableOnly

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (subject !== "All") params.set("subject", subject)
      if (maxRate) params.set("maxRate", maxRate)
      if (availableOnly) params.set("available", "true")

      try {
        const res = await fetch(`/api/teachers?${params}`)
        const data = await res.json()
        if (!cancelled) setTeachers(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setTeachers([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [debouncedSearch, subject, maxRate, availableOnly])

  function clearFilters() {
    setSubject("All")
    setMaxRate("")
    setAvailableOnly(false)
    setSearch("")
  }

  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight">Find a Teacher</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Connect with verified expert teachers for live 1-on-1 sessions. Search by subject, rate, or availability.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1 text-muted-foreground">
                    <X className="h-3 w-3" /> Clear all
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Max rate (₹)"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
                <Button
                  variant={availableOnly ? "default" : "outline"}
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className="h-10"
                >
                  {availableOnly ? "Available Now" : "Show Available"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Finding teachers...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 rounded-xl border bg-muted/50 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Try adjusting your filters or search terms to find available teachers.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" /> Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teachers.map((teacher) => {
            const initials = getInitials(teacher.displayName)
            return (
              <Link key={teacher.id} href={`/student/teachers/${teacher.id}`}>
                <Card className="group transition-shadow hover:shadow-md cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={teacher.avatarUrl ?? ""} />
                          <AvatarFallback className="bg-muted text-lg font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {teacher.isAvailableNow && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base">{teacher.displayName}</h3>
                          {teacher.isAvailableNow && (
                            <Badge variant="success" className="text-[10px] px-1.5 py-0.5">Available</Badge>
                          )}
                          {teacher.rank === "top_mentor" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Top Mentor</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {teacher.bio ?? "Experienced educator ready to help you master your subjects."}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {teacher.subjects.slice(0, 2).join(", ")}
                            {teacher.subjects.length > 2 && ` +${teacher.subjects.length - 2}`}
                          </span>
                          {teacher.hourlyRateInr && (
                            <span className="flex items-center gap-1 font-medium">
                              <IndianRupee className="h-3 w-3" />
                              {teacher.hourlyRateInr}/hr
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {teacher.compositeScore.toFixed(1)}
                          </span>
                          <span>
                            {teacher.totalSessions} sessions
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
