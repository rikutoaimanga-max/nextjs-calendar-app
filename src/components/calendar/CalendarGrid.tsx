
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
import { useRef } from "react";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { CalendarEvent, Calendar } from "@/types";

interface CalendarGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    selectedDate?: Date;
    onDayClick: (date: Date) => void;
    onDayDoubleClick?: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    calendars?: Calendar[];
}

export function CalendarGrid({ currentDate, events, selectedDate, onDayClick, onDayDoubleClick, onEventClick, calendars }: CalendarGridProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

    // Ref to track click timer
    const clickTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const handleCellClick = (day: Date) => {
        const key = day.toISOString();

        if (clickTimeoutRef.current[key]) {
            // Double click detected
            clearTimeout(clickTimeoutRef.current[key]);
            delete clickTimeoutRef.current[key];
            if (onDayDoubleClick) {
                onDayDoubleClick(day);
            }
        } else {
            // First click - wait for potential second click
            clickTimeoutRef.current[key] = setTimeout(() => {
                // Timer expired - it was a single click
                onDayClick(day);
                delete clickTimeoutRef.current[key];
            }, 250); // 250ms wait
        }
    };

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
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => handleCellClick(day)}
                            className={cn(
                                "min-h-[100px] md:min-h-[200px] lg:min-h-[250px] border-b border-r border-white/5 p-1 relative transition-all duration-200 cursor-pointer group select-none",
                                !isCurrentMonth && "bg-black/20 text-muted-foreground/50",
                                isSelected ? "bg-primary/20 shadow-[inset_0_0_20px_rgba(0,224,208,0.3)]" : "hover:bg-white/5",
                                // Left border for first column
                                dayIdx % 7 === 0 && "border-l-0"
                            )}
                        >
                            {isSelected && (
                                <div className="absolute inset-0 border-2 border-primary/80 rounded-lg pointer-events-none z-0" />
                            )}

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
                                    .slice(0, 15)
                                    .map((event) => {
                                        const calendar = calendars?.find(c => c.id === event.calendarId);
                                        const colorClass = calendar ? calendar.color : "bg-gray-500";

                                        return (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick(event);
                                                }}
                                                className={cn(
                                                    "text-[10px] md:text-sm lg:text-base truncate rounded px-1.5 py-0.5 text-white bg-opacity-90 shadow-sm transition-transform hover:scale-105",
                                                    colorClass
                                                )}
                                            >
                                                {event.title}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

