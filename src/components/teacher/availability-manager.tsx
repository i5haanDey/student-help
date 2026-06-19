"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Clock } from "lucide-react"
import { toast } from "sonner"

interface Slot {
  id: string
  teacherId: string
  slotStart: string
  slotEnd: string
  isRecurring: boolean
  isBooked: boolean
}

export function AvailabilityManager() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newSlot, setNewSlot] = useState({ date: "", startTime: "09:00", endTime: "10:00" })
  const [recurring, setRecurring] = useState(false)
  const [recurringDays, setRecurringDays] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  function toggleDay(day: string) {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  useEffect(() => {
    fetch("/api/teachers/availability")
      .then((r) => r.json())
      .then((data) => setSlots(data))
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setIsLoading(false))
  }, [])

  async function addSlot() {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Fill in all fields")
      return
    }

    if (recurring && recurringDays.length === 0) {
      toast.error("Select at least one day for recurring schedule")
      return
    }

    setIsSaving(true)
    const slotStart = new Date(`${newSlot.date}T${newSlot.startTime}:00`)
    const slotEnd = new Date(`${newSlot.date}T${newSlot.endTime}:00`)

    if (slotEnd <= slotStart) {
      toast.error("End time must be after start time")
      setIsSaving(false)
      return
    }

    try {
      const slots = recurring
        ? recurringDays.map((day) => {
            const d = new Date(slotStart)
            const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day)
            const currentDay = d.getDay()
            const diff = (dayIndex - currentDay + 7) % 7
            d.setDate(d.getDate() + diff)
            const end = new Date(d)
            end.setHours(slotEnd.getHours(), slotEnd.getMinutes())
            return { slotStart: d.toISOString(), slotEnd: end.toISOString(), isRecurring: true }
          })
        : [{ slotStart: slotStart.toISOString(), slotEnd: slotEnd.toISOString() }]

      const res = await fetch("/api/teachers/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      toast.success(`${data.count} slot(s) added`)

      const updated = await fetch("/api/teachers/availability").then((r) => r.json())
      setSlots(updated)
      setNewSlot({ date: "", startTime: "09:00", endTime: "10:00" })
      setRecurring(false)
      setRecurringDays([])
    } catch {
      toast.error("Failed to add slot")
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteSlot(id: string) {
    try {
      const res = await fetch("/api/teachers/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error()

      setSlots((prev) => prev.filter((s) => s.id !== id))
      toast.success("Slot removed")
    } catch {
      toast.error("Failed to remove slot")
    }
  }

  const upcomingSlots = slots
    .filter((s) => new Date(s.slotStart) > new Date())
    .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Add Availability Slot
          </CardTitle>
          <CardDescription>Set time slots when you are available for teaching.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Recurring weekly</span>
            </label>
          </div>

          {recurring && (
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    recurringDays.includes(day)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>{recurring ? "Start Date" : "Date"}</Label>
              <Input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addSlot} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {recurring ? "Add Weekly" : "Add Slot"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle>Your Slots ({upcomingSlots.length})</CardTitle>
            <CardDescription>Review and manage your availability.</CardDescription>
          </CardHeader>
        <CardContent>
          {upcomingSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No availability slots set yet. Add your first slot above.
            </p>
          ) : (
            <div className="grid gap-2">
              {upcomingSlots.map((slot) => {
                const start = new Date(slot.slotStart)
                const end = new Date(slot.slotEnd)
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {start.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {start.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {end.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {slot.isRecurring && (
                        <Badge variant="secondary" className="text-xs">Recurring</Badge>
                      )}
                      {slot.isBooked && (
                        <Badge variant="secondary" className="text-xs">Booked</Badge>
                      )}
                      {showDeleteConfirm === slot.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { deleteSlot(slot.id); setShowDeleteConfirm(null) }}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setShowDeleteConfirm(slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
