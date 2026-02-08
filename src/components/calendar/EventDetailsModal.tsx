"use client";

import { X, Calendar as CalendarIcon, MapPin, AlignLeft, Link as LinkIcon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEvent, Calendar } from "@/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    event: CalendarEvent | undefined;
    calendars: Calendar[];
}

export function EventDetailsModal({ isOpen, onClose, onEdit, event, calendars }: EventDetailsModalProps) {
    if (!isOpen || !event) return null;

    const calendar = calendars.find(c => c.id === event.calendarId);

    const formatDate = (date: Date) => {
        return format(date, "M月d日(E)", { locale: ja });
    };

    const formatTime = (date: Date) => {
        return format(date, "H:mm", { locale: ja });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        {calendar && (
                            <div className={`w-3 h-3 rounded-full ${calendar.color}`} />
                        )}
                        <span className="text-sm text-gray-400">{calendar?.name || "カレンダーなし"}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-gray-400 hover:text-white h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white break-words">{event.title}</h2>

                    {/* Date & Time */}
                    <div className="flex items-start gap-3 text-gray-300">
                        <CalendarIcon className="w-5 h-5 mt-0.5 text-gray-500" />
                        <div>
                            <div className="text-base font-medium">
                                {formatDate(event.start)}
                                {event.end && formatDate(event.start) !== formatDate(event.end) && ` - ${formatDate(event.end)}`}
                            </div>
                            {!event.allDay && (
                                <div className="text-sm text-gray-400 mt-1">
                                    {formatTime(event.start)}
                                    {event.end && ` - ${formatTime(event.end)}`}
                                </div>
                            )}
                            {event.allDay && <div className="text-sm text-gray-400 mt-1">終日</div>}
                        </div>
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div className="flex items-start gap-3 text-gray-300">
                            <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />
                            <span className="text-base break-words">{event.location}</span>
                        </div>
                    )}

                    {/* URL */}
                    {event.url && (
                        <div className="flex items-start gap-3 text-gray-300">
                            <LinkIcon className="w-5 h-5 mt-0.5 text-gray-500" />
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                            >
                                {event.url}
                            </a>
                        </div>
                    )}

                    {/* Memo/Description */}
                    {event.description && (
                        <div className="flex items-start gap-3 text-gray-300">
                            <AlignLeft className="w-5 h-5 mt-0.5 text-gray-500" />
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {event.description}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-white/5">
                    <Button variant="ghost" onClick={onEdit} className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2">
                        <Edit className="w-4 h-4" />
                        編集する
                    </Button>
                </div>
            </div>
        </div>
    );
}
