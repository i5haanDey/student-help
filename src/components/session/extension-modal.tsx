"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Clock, IndianRupee, Loader2 } from "lucide-react"

interface ExtensionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (minutes: number) => Promise<void>
  hourlyRate: number
  isSubmitting: boolean
}

const PRESETS = [10, 20, 30]

export function ExtensionModal({ isOpen, onClose, onConfirm, hourlyRate, isSubmitting }: ExtensionModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)
  const [customMinutes, setCustomMinutes] = useState(15)

  const minutes = selectedMinutes ?? customMinutes
  const freeMinutes = Math.min(minutes, 10)
  const paidMinutes = Math.max(0, minutes - freeMinutes)
  const cost = Math.round((hourlyRate / 60) * paidMinutes * 100) / 100

  async function handleConfirm() {
    if (minutes < 1) return
    await onConfirm(minutes)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSubmitting) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Extend Session
          </DialogTitle>
          <DialogDescription>
            Session ends in 10 minutes. How much more time do you need?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={selectedMinutes === preset ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedMinutes(preset)}
              >
                {preset} min
              </Button>
            ))}
            <Button
              variant={selectedMinutes === null ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSelectedMinutes(null)}
            >
              Custom
            </Button>
          </div>

          {selectedMinutes === null && (
            <div className="space-y-2">
              <Label htmlFor="custom-minutes">Custom duration (1-30 min)</Label>
              <div className="flex items-center gap-3">
                <input
                  id="custom-minutes"
                  type="range"
                  min={1}
                  max={30}
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-bold tabular-nums w-12 text-center">
                  {customMinutes}
                </span>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Free extension</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{freeMinutes} min</span>
            </div>
            {paidMinutes > 0 && (
              <div className="flex justify-between">
                <span>Paid extension @ ₹{hourlyRate}/hr</span>
                <span className="font-medium">{paidMinutes} min</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 mt-1 font-semibold">
              <span>Total cost</span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                {cost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || minutes < 1}>
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending Request...</>
            ) : (
              `Request ${minutes} min`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
