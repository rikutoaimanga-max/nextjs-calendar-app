"use client";

import { useState, useEffect } from "react";
import { format, addHours } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarEvent, CalendarType, CALENDAR_LABELS, CALENDAR_COLORS } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MapPin, Link as LinkIcon, Repeat, FileText, CheckSquare, Paperclip, User, Clock, Bell } from "lucide-react";

// Helper for reminder options
const REMINDER_OPTIONS = [
    { value: "at_start", label: "イベント開始時", minutes: 0 },
    { value: "5_min_before", label: "5分前", minutes: 5 },
    { value: "15_min_before", label: "15分前", minutes: 15 },
    { value: "30_min_before", label: "30分前", minutes: 30 },
    { value: "1_hour_before", label: "1時間前", minutes: 60 },
    { value: "1_day_before", label: "1日前", minutes: 24 * 60 },
];

const REPEAT_OPTIONS = [
    { value: "none", label: "繰り返しなし" },
    { value: "daily", label: "毎日" },
    { value: "weekly", label: "毎週" },
    { value: "monthly", label: "毎月" },
    { value: "yearly", label: "毎年" },
];

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, "id">) => void;
    onDelete?: (eventId: string) => void;
    initialDate?: Date;
    event?: CalendarEvent;
}

export function AddEventModal({ isOpen, onClose, onSave, onDelete, initialDate, event }: AddEventModalProps) {
    const [title, setTitle] = useState("");

    // Date & Time
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("10:00");
    const [isAllDay, setIsAllDay] = useState(false);
    const [isMemo, setIsMemo] = useState(false); // Save to memo

    // Type
    const [type, setType] = useState<CalendarType>("personal");

    // Details
    const [location, setLocation] = useState("");
    const [url, setUrl] = useState("");
    const [repeat, setRepeat] = useState("none");
    const [memo, setMemo] = useState(""); // Description
    const [checklist, setChecklist] = useState<{ id: string; text: string; checked: boolean }[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState("");

    // Reminder State
    const [reminders, setReminders] = useState<{ type: string; time?: Date }[]>([]);
    const [selectedReminderType, setSelectedReminderType] = useState("none");
    const [customReminderTime, setCustomReminderTime] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (event) {
                // Edit mode
                setTitle(event.title);
                setStartDate(format(event.start, "yyyy-MM-dd"));
                setStartTime(format(event.start, "HH:mm"));

                if (event.end) {
                    setEndDate(format(event.end, "yyyy-MM-dd"));
                    setEndTime(format(event.end, "HH:mm"));
                } else {
                    // Default end is +1 hour
                    const end = addHours(event.start, 1);
                    setEndDate(format(end, "yyyy-MM-dd"));
                    setEndTime(format(end, "HH:mm"));
                }

                setIsAllDay(event.allDay);
                setType(event.calendarId);
                setLocation(event.location || "");
                setUrl(event.url || "");
                setRepeat(event.repeat || "none");
                setMemo(event.description || "");
                setIsMemo(event.isMemo || false);
                setChecklist(event.checklist || []);

                // Reminders
                if (event.reminderTimes && event.reminderTimes.length > 0) {
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
                const sDate = format(initialDate, "yyyy-MM-dd");
                setStartDate(sDate);
                setEndDate(sDate);

                const now = new Date();
                const currentHour = now.getHours();
                const nextHour = (currentHour + 1) % 24;
                const nextNextHour = (currentHour + 2) % 24;

                setStartTime(`${String(nextHour).padStart(2, '0')}:00`);
                setEndTime(`${String(nextNextHour).padStart(2, '0')}:00`);

                setTitle("");
                setIsAllDay(false);
                setIsMemo(false);
                setLocation("");
                setUrl("");
                setRepeat("none");
                setMemo("");
                setChecklist([]);
                setReminders([]);
            }
            setSelectedReminderType("none");
            setCustomReminderTime("");
        }
    }, [isOpen, initialDate, event]);

    const addReminder = () => {
        if (selectedReminderType === "none") return;
        if (!startDate || (!startTime && !isAllDay)) return;

        // For all day, assume 9 AM for reminder calc
        const timeStr = isAllDay ? "09:00" : startTime;
        const start = new Date(`${startDate}T${timeStr}`);

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

    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        setChecklist([...checklist, { id: Math.random().toString(36).substr(2, 9), text: newChecklistItem, checked: false }]);
        setNewChecklistItem("");
    };

    const toggleChecklistItem = (id: string) => {
        setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const removeChecklistItem = (id: string) => {
        setChecklist(checklist.filter(item => item.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startDate) return;

        const start = new Date(`${startDate}T${isAllDay ? "00:00" : startTime}`);
        const end = new Date(`${endDate}T${isAllDay ? "23:59" : endTime}`);

        onSave({
            title,
            start,
            end,
            allDay: isAllDay,
            calendarId: type,
            location,
            url,
            description: memo,
            isMemo,
            repeat,
            checklist,
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
        setTitle("");
        setReminders([]);
        setChecklist([]);
        onClose();
    };

    const getReminderLabel = (r: { type: string, time?: Date }) => {
        if (r.type === 'custom' && r.time) {
            return `${r.time.toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
        }
        const match = REMINDER_OPTIONS.find(o => o.value === r.type);
        return match ? match.label : r.type;
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={event ? "予定を編集" : "予定を追加"}>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Title */}
                <div>
                    <input
                        type="text"
                        className="w-full text-2xl font-bold bg-transparent border-b-2 border-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-500 py-2 text-primary"
                        placeholder="タイトル"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                {/* Date & Time Section */}
                <div className="bg-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium w-12 text-gray-400">開始</label>
                        <input
                            type="date"
                            className="flex-1 bg-white/10 border-0 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                        {!isAllDay && (
                            <input
                                type="time"
                                className="w-24 bg-white/10 border-0 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium w-12 text-gray-400">終了</label>
                        <input
                            type="date"
                            className="flex-1 bg-white/10 border-0 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                        {!isAllDay && (
                            <input
                                type="time"
                                className="w-24 bg-white/10 border-0 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={isAllDay}
                                onChange={(e) => setIsAllDay(e.target.checked)}
                            />
                            <span className="text-sm">終日</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={isMemo}
                                onChange={(e) => setIsMemo(e.target.checked)}
                            />
                            <span className="text-sm">メモに保存する</span>
                        </label>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                    {/* Calendar Type */}
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-1 gap-2">
                            {(Object.keys(CALENDAR_LABELS) as CalendarType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${type === t
                                        ? "bg-primary text-black font-bold border-primary"
                                        : "bg-transparent text-gray-400 border-white/10 hover:bg-white/5"
                                        }`}
                                    onClick={() => setType(t)}
                                >
                                    {CALENDAR_LABELS[t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Profile (Placeholder) */}
                    <div className="flex items-center gap-3">
                        <div className="w-5 flex justify-center"><div className="w-4 h-4 rounded-full bg-pink-300" /></div>
                        <span className="text-sm text-gray-400">自分</span>
                    </div>

                    {/* Notification */}
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 flex gap-2">
                            <select
                                className="flex-1 p-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-primary"
                                value={selectedReminderType}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedReminderType(val);
                                    if (val !== "custom") setCustomReminderTime("");
                                }}
                            >
                                <option value="none" className="text-black bg-white">通知なし</option>
                                {REMINDER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="text-black bg-white">{opt.label}</option>
                                ))}
                                <option value="custom" className="text-black bg-white">指定日時</option>
                            </select>
                            <Button type="button" size="sm" onClick={addReminder} disabled={selectedReminderType === "none"}>＋</Button>
                        </div>
                    </div>
                    {/* Existing Reminders List */}
                    {reminders.length > 0 && (
                        <div className="pl-8 space-y-1">
                            {reminders.map((r, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                    <span>{getReminderLabel(r)}</span>
                                    <button type="button" onClick={() => removeReminder(idx)} className="text-primary hover:text-white">✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Repeat */}
                    <div className="flex items-center gap-3">
                        <Repeat className="w-5 h-5 text-gray-400" />
                        <select
                            className="flex-1 p-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-primary placeholder:text-gray-600"
                            value={repeat}
                            onChange={(e) => setRepeat(e.target.value)}
                        >
                            {REPEAT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="text-black bg-white">{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* URL */}
                    <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-gray-400" />
                        <input
                            type="url"
                            className="flex-1 bg-transparent border-b border-white/10 p-2 text-sm focus:border-primary outline-none transition-all"
                            placeholder="URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-b border-white/10 p-2 text-sm focus:border-primary outline-none transition-all"
                            placeholder="場所"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    {/* Attachments (Placeholder) */}
                    <div className="flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-b border-white/10 p-2 text-sm focus:border-primary outline-none transition-all"
                            placeholder="ファイルを添付する"
                            readOnly
                        />
                    </div>

                    {/* Memo */}
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-2" />
                        <div className="flex-1">
                            <input
                                type="text" // Using input for collapsed look, could be textarea
                                className="w-full bg-transparent border-b border-white/10 p-2 text-sm focus:border-primary outline-none transition-all"
                                placeholder="メモ"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="flex items-start gap-3">
                        <CheckSquare className="w-5 h-5 text-gray-400 mt-2" />
                        <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-b border-white/10 p-2 text-sm focus:border-primary outline-none transition-all"
                                    placeholder="チェックリスト"
                                    value={newChecklistItem}
                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                                />
                                <Button type="button" size="sm" variant="ghost" onClick={addChecklistItem}>＋</Button>
                            </div>
                            {checklist.map(item => (
                                <div key={item.id} className="flex items-center gap-2 pl-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-500 bg-transparent"
                                        checked={item.checked}
                                        onChange={() => toggleChecklistItem(item.id)}
                                    />
                                    <span className={`text-sm flex-1 ${item.checked ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                                    <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-gray-500 hover:text-red-400">×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6 flex justify-between gap-4 border-t border-white/10">
                    {event && onDelete ? (
                        <Button type="button" variant="ghost" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                            削除
                        </Button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={handleClose} className="border-white/10 text-gray-300 hover:bg-white/5">
                            キャンセル
                        </Button>
                        <Button type="submit" className="px-8 font-bold bg-primary text-black hover:bg-primary/90">
                            保存
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

