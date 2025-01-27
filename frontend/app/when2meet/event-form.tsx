"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import type { Event } from "./types"

interface EventFormProps {
  onSubmit: (event: Omit<Event, "id">) => void
}

export function EventForm({ onSubmit }: EventFormProps) {
  const [isRecurring, setIsRecurring] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    onSubmit({
      summary: formData.get("summary") as string,
      start: formData.get("start") as string,
      end: formData.get("end") as string,
      isRecurring,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="summary">Event Title</Label>
        <Input id="summary" name="summary" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start">Start Time</Label>
          <Input id="start" name="start" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">End Time</Label>
          <Input id="end" name="end" type="datetime-local" required />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
        />
        <Label htmlFor="recurring">Repeat weekly</Label>
      </div>
      <Button type="submit" className="w-full">
        Add Event
      </Button>
    </form>
  )
}

