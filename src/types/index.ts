
export type CalendarType = 'personal' | 'work' | 'family';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    allDay: boolean;
    calendarId: CalendarType;
    description?: string; // Memo
    location?: string;
    url?: string;
    isMemo?: boolean; // Save to memo
    repeat?: string; // none, daily, weekly, monthly, yearly, custom
    checklist?: { id: string; text: string; checked: boolean }[];
    reminderTimes?: Date[]; // Absolute times for the reminders
    attachments?: string[]; // Placeholder for attachment names/urls
}


export const CALENDAR_COLORS: Record<CalendarType, string> = {
    personal: "bg-blue-500",
    work: "bg-green-500",
    family: "bg-orange-500",
};

export const CALENDAR_LABELS: Record<CalendarType, string> = {
    personal: "個人",
    work: "仕事",
    family: "家族",
};
