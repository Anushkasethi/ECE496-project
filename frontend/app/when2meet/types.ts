export interface Event {
    id: string
    summary: string
    start: string
    end: string
    color?: string
    isRecurring?: boolean
  }
  
  export interface CalendarEvent extends Omit<Event, "start" | "end"> {
    start: Date
    end: Date
  }
  
  