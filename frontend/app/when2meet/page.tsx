"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Plus, Search, Upload } from "lucide-react"
import { addDays, format, parseISO, startOfWeek } from "date-fns"
import { nanoid } from "nanoid"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Event, CalendarEvent } from "./types"
import { EventForm } from "./event-form"
import { generateRecurringEvents, getEventColor } from "./utils"

export default function Calendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [file, setFile] = React.useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a file")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://127.0.0.1:5000/parse", {
        method: "POST",
        body: formData,
      })

      const data: Event[] = await response.json()

      // Process the events and generate recurring instances
      const processedEvents = data.flatMap((event) => {
        const color = getEventColor(event.summary)
        return generateRecurringEvents({ ...event, id: nanoid(), color })
      })

      setEvents(processedEvents)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file")
    }
  }

  const handleAddEvent = (newEvent: Omit<Event, "id">) => {
    const event = {
      ...newEvent,
      id: nanoid(),
      color: getEventColor(newEvent.summary),
    }

    const processedEvents = newEvent.isRecurring
      ? generateRecurringEvents(event)
      : [
          {
            ...event,
            start: parseISO(newEvent.start),
            end: parseISO(newEvent.end),
          },
        ]

    setEvents((prev) => [...prev, ...processedEvents])
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 8 PM
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate), i))

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate((prev) => addDays(prev, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate((prev) => addDays(prev, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Input type="file" onChange={handleFileChange} className="max-w-[200px]" />
          <Button onClick={handleUpload} disabled={!file}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Schedule
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-8" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <div className="grid grid-cols-8 border-b">
          <div className="border-r py-2" />
          {days.map((day) => (
            <div key={day.toISOString()} className="border-r px-2 py-2 text-center">
              <div className="text-sm font-medium">{format(day, "EEE")}</div>
              <div className="text-sm text-muted-foreground">{format(day, "d")}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8">
            <div className="border-r">
              {hours.map((hour) => (
                <div key={hour} className="relative border-b px-2 py-8">
                  <span className="absolute -top-3 text-sm text-muted-foreground">
                    {format(new Date().setHours(hour), "ha")}
                  </span>
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div key={day.toISOString()} className="border-r">
                {hours.map((hour) => (
                  <div key={hour} className="relative border-b py-8">
                    {events
                      .filter(
                        (event) =>
                          event.start.getDate() === day.getDate() &&
                          event.start.getMonth() === day.getMonth() &&
                          event.start.getHours() === hour,
                      )
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`absolute inset-x-0 mx-1 rounded px-2 py-1 ${event.color}`}
                          style={{
                            top: `${(event.start.getMinutes() / 60) * 100}%`,
                            height: `${((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 100}%`,
                          }}
                        >
                          <div className="text-sm font-medium truncate">{event.summary}</div>
                          <div className="text-xs">
                            {format(event.start, "h:mma")} - {format(event.end, "h:mma")}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" className="absolute bottom-6 right-6 h-12 w-12 rounded-full">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <EventForm onSubmit={handleAddEvent} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

