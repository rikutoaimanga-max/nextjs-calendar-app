
export type CalendarType = string;

export interface Calendar {
    id: string;
    name: string;
    color: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    allDay: boolean;
    calendarId: string;
    description?: string; // Memo
    location?: string;
    url?: string;
    isMemo?: boolean; // Save to memo
    repeat?: string; // none, daily, weekly, monthly, yearly, custom
    checklist?: { id: string; text: string; checked: boolean }[];
    reminderTimes?: Date[]; // Absolute times for the reminders
    attachments?: string[]; // Placeholder for attachment names/urls
}


// export const DEFAULT_CALENDARS: Calendar[] = []; 
// Deprecated: Dynamic calendars are now used.
// export const CALENDAR_COLORS = ...
// export const CALENDAR_LABELS = ...
export const CALENDAR_COLORS: Record<string, string> = {};
export const CALENDAR_LABELS: Record<string, string> = {};
