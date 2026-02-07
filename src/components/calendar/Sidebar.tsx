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
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">カレンダーリスト</h2>
                    </div>

                    <div className="space-y-3">
                        {calendars.map(cal => (
                            <div key={cal.id} className="relative group">
                                <button
                                    onClick={() => onToggleCalendar(cal.id)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left border ${selectedCalendarIds.includes(cal.id)
                                        ? "bg-white/10 border-primary/50"
                                        : "bg-transparent border-transparent hover:bg-white/5"
                                        }`}
                                >
                                    {/* Cover Image or Color Placeholder */}
                                    <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm ${!cal.coverImage && "bg-white/5 flex items-center justify-center"}`}>
                                        {cal.coverImage ? (
                                            <img src={cal.coverImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-6 h-6 rounded-full ${cal.color}`} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-base truncate">{cal.name}</div>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${cal.color}`} />
                                            {selectedCalendarIds.includes(cal.id) ? "表示中" : "非表示"}
                                        </div>
                                    </div>

                                    {selectedCalendarIds.includes(cal.id) && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,224,208,0.5)]" />
                                        </div>
                                    )}
                                </button>

                                {calendars.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(cal.id, cal.name);
                                        }}
                                        className="absolute -top-1 -right-1 p-1 bg-gray-800 rounded-full text-gray-400 hover:text-red-500 hover:bg-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                                        title="削除"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full py-4 mt-2 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all group"
                        >
                            <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">新しいカレンダーを作る</span>
                        </button>
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
