"use client";

import { useState, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
import { Plus, Menu } from "lucide-react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Sidebar } from "@/components/calendar/Sidebar";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import { Button } from "@/components/ui/button";
import { CalendarEvent, Calendar as CalendarType, DEFAULT_CALENDARS } from "@/types";
import { useNotifications } from "@/hooks/use-notifications";
import { useReminders } from "@/hooks/use-reminders";
import { Bell } from "lucide-react";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calendars State
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { permission, requestPermission, sendNotification } = useNotifications();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile toggle

  // Enable polling for reminders
  useReminders(events);

  // Initialize Data
  useEffect(() => {
    // 1. Load Calendars
    const savedCalendars = localStorage.getItem('calendar_definitions');
    let loadedCalendars: CalendarType[] = [];

    if (savedCalendars) {
      try {
        loadedCalendars = JSON.parse(savedCalendars);
      } catch (e) {
        console.error("Failed to parse calendars", e);
        loadedCalendars = DEFAULT_CALENDARS;
      }
    } else {
      loadedCalendars = DEFAULT_CALENDARS;
    }

    setCalendars(loadedCalendars);
    // Select all by default if not saved (could save selection state too, but all is safe)
    setSelectedCalendarIds(loadedCalendars.map(c => c.id));

    // 2. Load Events
    const savedEvents = localStorage.getItem('calendar_events');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        const hydratedEvents = parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: e.end ? new Date(e.end) : undefined,
          reminderTimes: e.reminderTimes ? e.reminderTimes.map((rt: string) => new Date(rt)) : undefined
        }));
        setEvents(hydratedEvents);
      } catch (error) {
        console.error("Failed to parse events from local storage:", error);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save Calendars
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calendar_definitions', JSON.stringify(calendars));
    }
  }, [calendars, isLoaded]);

  // Save Events
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
    setSelectedDate(date);
  };

  const handleDayAdd = (date: Date) => {
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
    // Determine color from calendar definition if needed, but currently type has color
    if (selectedEvent) {
      // Update
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : e));
      if (permission === "granted") {
        sendNotification("予定を更新しました", { body: `${eventData.title}` });
      }
    } else {
      // Create
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setEvents([...events, newEvent]);
      if (permission === "granted") {
        sendNotification("予定を追加しました", { body: `${newEvent.title}` });
      }
    }
    setIsModalOpen(false);
    setSelectedEvent(undefined);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(undefined);
    if (permission === "granted") sendNotification("予定を削除しました");
  };

  const filteredEvents = events.filter(event => selectedCalendarIds.includes(event.calendarId));

  const toggleCalendar = (id: string) => {
    setSelectedCalendarIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const addCalendar = (newCalendar: CalendarType) => {
    setCalendars([...calendars, newCalendar]);
    setSelectedCalendarIds([...selectedCalendarIds, newCalendar.id]);
  };

  return (
    <main className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar Backdroup */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          calendars={calendars}
          selectedCalendarIds={selectedCalendarIds}
          onToggleCalendar={toggleCalendar}
          onAddCalendar={addCalendar}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative h-screen">
        <div className="flex items-center p-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        <CalendarHeader
          currentDate={currentDate}
          onNextMonth={nextMonth}
          onPrevMonth={prevMonth}
          onToday={goToToday}
        />

        {permission === "default" && (
          <div className="bg-primary/10 p-2 text-center text-sm flex items-center justify-center gap-2 text-primary mx-4 rounded-lg mb-2">
            <Bell className="h-4 w-4" />
            <span>通知を有効にすると、予定の確認ができます</span>
            <Button size="sm" variant="outline" onClick={requestPermission} className="h-7 text-xs bg-white border-primary/20 text-primary">
              有効にする
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 pt-0">
          <div className="h-full rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
            <CalendarGrid
              currentDate={currentDate}
              events={filteredEvents}
              selectedDate={selectedDate}
              onDayClick={handleDaySelect}
              onDayDoubleClick={handleDayAdd}
              onEventClick={handleEventClick}
              calendars={calendars} // Pass calendars map/array for colors
            />
          </div>
        </div>

        <Button
          className="absolute bottom-8 right-8 rounded-full w-14 h-14 md:w-16 md:h-16 shadow-[0_0_30px_rgba(0,224,208,0.3)] p-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 z-50 ring-2 ring-primary/20"
          onClick={() => {
            setSelectedDate(new Date());
            setSelectedEvent(undefined);
            setIsModalOpen(true);
          }}
          aria-label="予定を追加"
        >
          <Plus className="h-6 w-6 md:h-8 md:w-8" />
        </Button>
      </div>

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
        calendars={calendars} // Pass dynamic calendars
      />
    </main>
  );
}



