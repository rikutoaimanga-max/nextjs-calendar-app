
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent, CalendarType, CALENDAR_LABELS, CALENDAR_COLORS } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";


// Helper for reminder options
const REMINDER_OPTIONS = [
    { value: "at_start", label: "イベント開始時", minutes: 0 },
    { value: "5_min_before", label: "5分前", minutes: 5 },
    { value: "15_min_before", label: "15分前", minutes: 15 },
    { value: "30_min_before", label: "30分前", minutes: 30 },
    { value: "1_hour_before", label: "1時間前", minutes: 60 },
    { value: "1_day_before", label: "1日前", minutes: 24 * 60 },
];

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, "id">) => void;
    onDelete?: (eventId: string) => void; // Add delete callback
    initialDate?: Date;
    event?: CalendarEvent; // Add event prop for editing
}

export function AddEventModal({ isOpen, onClose, onSave, onDelete, initialDate, event }: AddEventModalProps) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("09:00");
    const [type, setType] = useState<CalendarType>("personal");

    // Reminder State
    const [reminders, setReminders] = useState<{ type: string; time?: Date }[]>([]);
    const [selectedReminderType, setSelectedReminderType] = useState("none");
    const [customReminderTime, setCustomReminderTime] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (event) {
                // Edit mode: populate fields
                setTitle(event.title);
                setDate(format(event.start, "yyyy-MM-dd"));
                setTime(format(event.start, "HH:mm"));
                setType(event.calendarId);

                if (event.reminderTimes && event.reminderTimes.length > 0) {
                    // Reconstruct reminders logic
                    const reconstructed = event.reminderTimes.map(rt => {
                        const diffMinutes = (event.start.getTime() - rt.getTime()) / 60000;
                        const match = REMINDER_OPTIONS.find(opt => Math.abs(opt.minutes - diffMinutes) < 1);
                        if (match) {
                            return { type: match.value, time: rt };
                        }
                        return { type: 'custom', time: rt };
                    });
                    setReminders(reconstructed);
                } else {
                    setReminders([]);
                }
            } else if (initialDate) {
                // New event mode
                setDate(format(initialDate, "yyyy-MM-dd"));
                setTitle("");
                setTime("09:00");
                setReminders([]);
                setCustomReminderTime("");
            }
            setSelectedReminderType("none");
            setCustomReminderTime("");
        }
    }, [isOpen, initialDate, event]);

    const addReminder = () => {
        if (selectedReminderType === "none") return;
        if (!date || !time) return; // Need start time to calculate

        const start = new Date(`${date}T${time}`);
        let newReminderTime: Date | undefined;

        if (selectedReminderType === "custom") {
            if (customReminderTime) {
                newReminderTime = new Date(customReminderTime);
            }
        } else {
            const option = REMINDER_OPTIONS.find(o => o.value === selectedReminderType);
            if (option) {
                newReminderTime = new Date(start.getTime() - option.minutes * 60000);
            }
        }

        if (newReminderTime) {
            // Avoid duplicates
            if (!reminders.some(r => r.time?.getTime() === newReminderTime?.getTime())) {
                setReminders([...reminders, { type: selectedReminderType, time: newReminderTime }]);
            }
            setSelectedReminderType("none");
            setCustomReminderTime("");
        }
    };

    const removeReminder = (index: number) => {
        setReminders(reminders.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        const start = new Date(`${date}T${time}`);

        onSave({
            title,
            start,
            allDay: false,
            calendarId: type,
            reminderTimes: reminders.map(r => r.time).filter((t): t is Date => !!t),
        });

        handleClose();
    };

    const handleDelete = () => {
        if (event && onDelete) {
            if (confirm("この予定を削除してもよろしいですか？")) {
                onDelete(event.id);
                handleClose();
            }
        }
    };

    const handleClose = () => {
        // Reset form
        setTitle("");
        setReminders([]);
        setSelectedReminderType("none");
        setCustomReminderTime("");
        onClose();
    };

    // Helper to format reminder label
    const getReminderLabel = (r: { type: string, time?: Date }) => {
        if (r.type === 'custom' && r.time) {
            return `${r.time.toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
        }
        const match = REMINDER_OPTIONS.find(o => o.value === r.type);
        return match ? match.label : r.type;
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={event ? "予定を編集" : "予定を追加"}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold mb-1.5 text-white uppercase tracking-wider">タイトル</label>
                    <input
                        type="text"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-black placeholder:text-gray-400"
                        placeholder="予定のタイトルを入力"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold mb-1.5 text-white uppercase tracking-wider">日付</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-black"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1.5 text-white uppercase tracking-wider">時間</label>
                        <input
                            type="time"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-black"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold mb-2 text-white uppercase tracking-wider">カレンダー</label>
                    <div className="flex gap-2">
                        {(Object.keys(CALENDAR_LABELS) as CalendarType[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${type === t
                                    ? "bg-primary text-black font-bold border-primary shadow-[0_0_15px_rgba(0,224,208,0.4)]"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-black"
                                    }`}
                                onClick={() => setType(t)}
                            >
                                {CALENDAR_LABELS[t]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">通知設定</label>

                    {/* List of existing reminders */}
                    <div className="space-y-2 mb-2">
                        {reminders.map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/10 p-2 rounded-lg text-sm text-white border border-white/5">
                                <span>🔔 {getReminderLabel(r)}</span>
                                <button type="button" onClick={() => removeReminder(idx)} className="text-gray-400 hover:text-red-400 p-1">✕</button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none appearance-none transition-all text-black"
                                value={selectedReminderType}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedReminderType(val);
                                    if (val !== "custom") {
                                        setCustomReminderTime("");
                                    }
                                }}
                            >

                                <option value="none" className="bg-white">通知を追加...</option>
                                {REMINDER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-white">{opt.label}</option>
                                ))}
                                <option value="custom" className="bg-white">指定日時</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                        <Button type="button" onClick={addReminder} disabled={selectedReminderType === "none" || (selectedReminderType === "custom" && !customReminderTime)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                            追加
                        </Button>
                    </div>

                    {selectedReminderType === "custom" && (
                        <input
                            type="datetime-local"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none mt-2 transition-all text-black"
                            value={customReminderTime}
                            onChange={(e) => setCustomReminderTime(e.target.value)}
                        />
                    )}
                </div>

                <div className="pt-4 flex justify-between gap-2">
                    {event && onDelete ? (
                        <Button type="button" variant="outline" onClick={handleDelete} className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-400">
                            削除
                        </Button>
                    ) : (
                        <div></div> // Spacer
                    )}
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={handleClose} className="text-gray-400 hover:text-white">
                            キャンセル
                        </Button>
                        <Button type="submit">保存</Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

