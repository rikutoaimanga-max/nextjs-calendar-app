"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Calendar } from "@/types";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    calendars: Calendar[];
    selectedCalendarIds: string[];
    onToggleCalendar: (id: string) => void;
    onAddCalendar: (calendar: Calendar) => void;
    onDeleteCalendar: (id: string) => void;
}



import { CreateCalendarModal } from "./CreateCalendarModal";

export function Sidebar({ calendars, selectedCalendarIds, onToggleCalendar, onAddCalendar, onDeleteCalendar }: SidebarProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleSaveCalendar = (calendarData: Omit<Calendar, "id">) => {
        const newCalendar: Calendar = {
            id: Math.random().toString(36).substr(2, 9),
            ...calendarData,
        };
        onAddCalendar(newCalendar);
        setIsCreateModalOpen(false);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`カレンダー「${name}」を削除しますか？\n含まれるすべての予定も削除されます。`)) {
            onDeleteCalendar(id);
        }
    };

    return (
        <div className="w-64 bg-background border-r border-white/10 flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-white/10">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-primary">TimeTree</span> Clone
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">カレンダー</h2>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {calendars.map(cal => (
                            <div key={cal.id} className="flex items-center gap-2 group relative">
                                <button
                                    onClick={() => onToggleCalendar(cal.id)}
                                    className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-all text-sm text-left overflow-hidden ${selectedCalendarIds.includes(cal.id)
                                        ? "bg-white/5 text-white"
                                        : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                        }`}
                                >
                                    {/* Cover Image Indicator (if exists) or Color Dot */}
                                    {cal.coverImage ? (
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                            <img src={cal.coverImage} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className={`w-3 h-3 rounded-full ${cal.color} ${selectedCalendarIds.includes(cal.id) ? 'ring-2 ring-white/20' : 'opacity-50'}`} />
                                    )}

                                    <span className="truncate flex-1">{cal.name}</span>
                                    {selectedCalendarIds.includes(cal.id) && <Check className="w-3 h-3 opacity-50" />}
                                </button>
                                {calendars.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(cal.id, cal.name);
                                        }}
                                        className="absolute right-2 p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                                        title="削除"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/10 text-xs text-gray-600 text-center">
                © 2026 Calendar App
            </div>

            <CreateCalendarModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveCalendar}
            />
        </div>
    );
}
