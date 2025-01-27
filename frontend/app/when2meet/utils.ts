import { addWeeks, parseISO, isSameDay, format } from "date-fns"
import type { Event, CalendarEvent } from "./types"

// Generate recurring events for the next n weeks
export function generateRecurringEvents(event: Event, weeks = 12): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const startDate = parseISO(event.start)
  const endDate = parseISO(event.end)

  for (let i = 0; i < weeks; i++) {
    events.push({
      ...event,
      id: `${event.id}-${i}`,
      start: addWeeks(startDate, i),
      end: addWeeks(endDate, i),
    })
  }

  return events
}

// Assign a consistent color based on the event summary
export function getEventColor(summary: string): string {
  const colors = [
    "bg-red-100 text-red-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-yellow-100 text-yellow-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
  ]

  // Generate a consistent index based on the summary
  const index = summary.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

