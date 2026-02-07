
"use client";

import { CalendarType, CALENDAR_LABELS, CALENDAR_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface CalendarFilterProps {
    selectedCalendars: CalendarType[];
    onToggle: (id: CalendarType) => void;
}

export function CalendarFilter({ selectedCalendars, onToggle }: CalendarFilterProps) {
    return (
        <div className="flex gap-2 p-4 bg-background/95 backdrop-blur-sm border-b border-white/5 overflow-x-auto sticky top-[80px] z-10">
            {(Object.keys(CALENDAR_LABELS) as CalendarType[]).map((type) => {
                const isSelected = selectedCalendars.includes(type);
                return (
                    <button
                        key={type}
                        onClick={() => onToggle(type)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border duration-300",
                            isSelected
                                ? "bg-white/10 border-white/20 text-foreground shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                : "bg-transparent border-white/5 text-muted-foreground opacity-50 grayscale hover:opacity-100"
                        )}
                    >
                        <span
                            className={cn(
                                "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                                type === 'personal' ? 'bg-blue-400 text-blue-400' :
                                    type === 'work' ? 'bg-green-400 text-green-400' :
                                        'bg-orange-400 text-orange-400'
                            )}
                        />
                        {CALENDAR_LABELS[type]}
                    </button>
                );
            })}
        </div>
    );
}

