"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Star, BookOpen, IndianRupee } from "lucide-react"
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

export function TeacherSearch() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [subject, setSubject] = useState("All")
  const [maxRate, setMaxRate] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Teacher</h1>
        <p className="text-muted-foreground mt-1">Connect with verified expert teachers for live sessions.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Max rate (₹)"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
            />
            <Button
              variant={availableOnly ? "default" : "outline"}
              onClick={() => setAvailableOnly(!availableOnly)}
            >
              {availableOnly ? "Available Now" : "Show Available"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground mt-4">No teachers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teachers.map((teacher) => (
            <Link key={teacher.id} href={`/student/teachers/${teacher.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={teacher.avatarUrl ?? ""} />
                      <AvatarFallback>{teacher.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{teacher.displayName}</h3>
                        {teacher.isAvailableNow && (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">Available</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {teacher.bio ?? "Experienced teacher ready to help you learn."}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {teacher.subjects.slice(0, 3).join(", ")}
                          {teacher.subjects.length > 3 && ` +${teacher.subjects.length - 3}`}
                        </span>
                        {teacher.hourlyRateInr && (
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {teacher.hourlyRateInr}/hr
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {teacher.compositeScore.toFixed(1)}
                        </span>
                        <span>{teacher.totalSessions} sessions</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
