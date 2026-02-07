
"use client";

import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameMonth,
    isSameDay,
    isToday,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { CalendarEvent, CALENDAR_COLORS } from "@/types";

interface CalendarGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDayClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void; // Add event click callback
}

export function CalendarGrid({ currentDate, events, onDayClick, onEventClick }: CalendarGridProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 border-b border-white/5 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                {weekDays.map((day, index) => (
                    <div
                        key={day}
                        className={cn(
                            "py-3 text-center text-xs md:text-base lg:text-lg font-bold tracking-wider",
                            index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-muted-foreground"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-card/20 backdrop-blur-sm rounded-b-xl overflow-hidden shadow-inner">
                {days.map((day, dayIdx) => {
                    // Adjust row height broadly
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDayClick(day)}
                            className={cn(
                                "min-h-[100px] md:min-h-[200px] lg:min-h-[250px] border-b border-r border-white/5 p-1 relative transition-all duration-200 hover:bg-white/5 cursor-pointer group",
                                !isCurrentMonth && "bg-black/20 text-muted-foreground/50",
                                // Left border for first column
                                dayIdx % 7 === 0 && "border-l-0"
                            )}
                        >

                            <div className="flex justify-center mt-1">
                                <span
                                    className={cn(
                                        "text-sm md:text-lg lg:text-xl w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all",
                                        isToday(day)
                                            ? "bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(0,224,208,0.4)]"
                                            : isCurrentMonth
                                                ? "text-foreground group-hover:bg-white/10"
                                                : "text-muted-foreground opacity-50"
                                    )}
                                >
                                    {format(day, "d")}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5 px-0.5 overflow-hidden">
                                {events
                                    .filter((event) => isSameDay(event.start, day))
                                    .slice(0, 15) // Show even more events on large screens
                                    .map((event) => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering onDayClick
                                                onEventClick(event);
                                            }}
                                            className={cn(
                                                "text-[10px] md:text-sm lg:text-base truncate rounded px-1.5 py-0.5 text-white bg-opacity-90 shadow-sm transition-transform hover:scale-105",
                                                event.calendarId === 'personal' ? 'bg-blue-500' :
                                                    event.calendarId === 'work' ? 'bg-green-500' :
                                                        event.calendarId === 'family' ? 'bg-orange-500' : 'bg-gray-500'
                                            )}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

