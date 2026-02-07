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
}

const PRESET_COLORS = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
];

export function Sidebar({ calendars, selectedCalendarIds, onToggleCalendar, onAddCalendar }: SidebarProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCalendarName, setNewCalendarName] = useState("");
    const [newCalendarColor, setNewCalendarColor] = useState(PRESET_COLORS[0]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCalendarName.trim()) return;

        const newCalendar: Calendar = {
            id: Math.random().toString(36).substr(2, 9),
            name: newCalendarName,
            color: newCalendarColor,
        };

        onAddCalendar(newCalendar);
        setNewCalendarName("");
        setIsAdding(false);
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
                            onClick={() => setIsAdding(true)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {calendars.map(cal => (
                            <div key={cal.id} className="flex items-center gap-2 group">
                                <button
                                    onClick={() => onToggleCalendar(cal.id)}
                                    className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-all text-sm text-left ${selectedCalendarIds.includes(cal.id)
                                            ? "bg-white/5 text-white"
                                            : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${cal.color} ${selectedCalendarIds.includes(cal.id) ? 'ring-2 ring-white/20' : 'opacity-50'}`} />
                                    <span className="truncate">{cal.name}</span>
                                    {selectedCalendarIds.includes(cal.id) && <Check className="w-3 h-3 ml-auto opacity-50" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {isAdding && (
                    <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10 animate-in slide-in-from-left-2 duration-200">
                        <form onSubmit={handleAdd} className="space-y-3">
                            <input
                                type="text"
                                placeholder="カレンダー名"
                                className="w-full bg-transparent border-b border-white/20 p-1 text-sm text-white focus:border-primary outline-none placeholder:text-gray-600"
                                value={newCalendarName}
                                onChange={(e) => setNewCalendarName(e.target.value)}
                                autoFocus
                            />

                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`w-4 h-4 rounded-full ${color} ${newCalendarColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                                        onClick={() => setNewCalendarColor(color)}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-7 text-xs text-gray-400 hover:text-white">
                                    キャンセル
                                </Button>
                                <Button type="submit" size="sm" className="h-7 text-xs bg-primary text-black hover:bg-primary/90">
                                    作成
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10 text-xs text-gray-600 text-center">
                © 2026 Calendar App
            </div>
        </div>
    );
}
