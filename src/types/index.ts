
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


export const DEFAULT_CALENDARS: Calendar[] = [
    { id: "personal", name: "個人", color: "bg-blue-500" },
    { id: "work", name: "仕事", color: "bg-green-500" },
    { id: "family", name: "家族", color: "bg-orange-500" },
];

export const CALENDAR_COLORS: Record<string, string> = {
    personal: "bg-blue-500",
    work: "bg-green-500",
    family: "bg-orange-500",
};

export const CALENDAR_LABELS: Record<string, string> = {
    personal: "個人",
    work: "仕事",
    family: "家族",
};
