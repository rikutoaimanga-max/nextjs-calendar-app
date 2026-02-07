
"use client";

import { useState, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
import { Plus } from "lucide-react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarFilter } from "@/components/calendar/CalendarFilter";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import { Button } from "@/components/ui/button";
import { CalendarEvent, CalendarType } from "@/types";
import { useNotifications } from "@/hooks/use-notifications";
import { useReminders } from "@/hooks/use-reminders";
import { Bell } from "lucide-react";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCalendars, setSelectedCalendars] = useState<CalendarType[]>(['personal', 'work', 'family']);
  const { permission, requestPermission, sendNotification } = useNotifications();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  // Enable polling for reminders
  useReminders(events);

  // Load events from local storage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar_events');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        // Convert date strings back to Date objects
        const hydratedEvents = parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: e.end ? new Date(e.end) : undefined,
          // Reconstruct custom reminder times if they exist
          reminderTimes: e.reminderTimes ? e.reminderTimes.map((rt: string) => new Date(rt)) : undefined
        }));
        setEvents(hydratedEvents);
      } catch (error) {
        console.error("Failed to parse events from local storage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save events to local storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calendar_events', JSON.stringify(events));
    }
  }, [events, isLoaded]);


  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDaySelect = (date: Date) => {
    console.log("Day selected (single click):", date);
    setSelectedDate(date);
    // Explicitly ensure modal is NOT opened here
  };

  const handleDayAdd = (date: Date) => {
    console.log("Day added (double click):", date);
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(event.start);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, "id">) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(e =>
        e.id === selectedEvent.id
          ? { ...eventData, id: selectedEvent.id }
          : e
      ));
      if (permission === "granted") {
        sendNotification("予定を更新しました", {
          body: `${eventData.title} - ${eventData.start.toLocaleDateString()}`,
        });
      }
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setEvents([...events, newEvent]);

      if (permission === "granted") {
        sendNotification("予定を追加しました", {
          body: `${newEvent.title} - ${eventData.start.toLocaleDateString()}`,
        });
      }
    }
    setIsModalOpen(false);
    setSelectedEvent(undefined);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(undefined);

    if (permission === "granted") {
      sendNotification("予定を削除しました");
    }
  };

  const filteredEvents = events.filter(event => selectedCalendars.includes(event.calendarId));

  const toggleCalendar = (type: CalendarType) => {
    setSelectedCalendars(prev =>
      prev.includes(type) ? prev.filter(c => c !== type) : [...prev, type]
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-background relative">
      <CalendarHeader
        currentDate={currentDate}
        onNextMonth={nextMonth}
        onPrevMonth={prevMonth}
        onToday={goToToday}
      />
      <CalendarFilter selectedCalendars={selectedCalendars} onToggle={toggleCalendar} />

      {permission === "default" && (
        <div className="bg-primary/10 p-2 text-center text-sm flex items-center justify-center gap-2 text-primary">
          <Bell className="h-4 w-4" />
          <span>通知を有効にすると、予定の確認ができます</span>
          <Button size="sm" variant="outline" onClick={requestPermission} className="h-7 text-xs bg-white border-primary/20 text-primary">
            有効にする
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <CalendarGrid
          currentDate={currentDate}
          events={filteredEvents}
          selectedDate={selectedDate}
          onDayClick={handleDaySelect}
          onDayDoubleClick={handleDayAdd}
          onEventClick={handleEventClick}
        />
      </div>



      <Button
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-[0_0_30px_rgba(0,224,208,0.3)] p-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 z-50 ring-2 ring-primary/20"
        onClick={() => {
          setSelectedDate(new Date());
          setSelectedEvent(undefined);
          setIsModalOpen(true);
        }}
        aria-label="予定を追加"
      >
        <Plus className="h-8 w-8" />
      </Button>



      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(undefined);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialDate={selectedDate}
        event={selectedEvent}
      />
    </main>
  );
}



