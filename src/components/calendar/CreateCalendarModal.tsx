"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/types";

interface CreateCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (calendar: Omit<Calendar, "id">) => void;
}

const PRESET_COLORS = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500",
    "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500",
    "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
    "bg-pink-500", "bg-rose-500",
];

export function CreateCalendarModal({ isOpen, onClose, onSave }: CreateCalendarModalProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[10]); // Default blue-ish
    const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const resizedImage = await resizeImage(file);
                setCoverImage(resizedImage);
            } catch (error) {
                console.error("Image processing failed:", error);
                alert("画像の処理に失敗しました。別の画像を試してください。");
            }
        }
    };

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1200;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.7)); // Compress to JPEG with 0.7 quality
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert("カレンダー名を入力してください。");
            return;
        }
        onSave({ name, color, coverImage });
        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setName("");
        setColor(PRESET_COLORS[10]);
        setCoverImage(undefined);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">カレンダー設定</h2>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Cover Image */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">カバー画像</label>
                        <div
                            className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-white/20 hover:border-white/40 transition-colors group cursor-pointer bg-black/20"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {coverImage ? (
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 group-hover:text-gray-300">
                                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                    <span className="text-xs">クリックして画像を選択</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {coverImage && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setCoverImage(undefined); }}
                                className="text-xs text-red-400 hover:text-red-300 underline"
                            >
                                画像を削除
                            </button>
                        )}
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">カレンダー名</label>
                        <input
                            type="text"
                            placeholder="例: 仕事、プライベート"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* theme Color */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">テーマカラー</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-6 h-6 rounded-full ${c} transition-all ${color === c ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100"
                                        }`}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-white/5">
                    <Button variant="ghost" onClick={handleClose} className="text-gray-400 hover:text-white">
                        キャンセル
                    </Button>
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        保存
                    </Button>
                </div>
            </div>
        </div>
    );
}
