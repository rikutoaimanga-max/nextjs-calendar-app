
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
            <div
                className="bg-[#1E1E1E] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10 ring-1 ring-white/5"
            >
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <h3 className="font-semibold text-lg tracking-wide text-white">{title}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="hover:bg-white/10 hover:text-white rounded-full h-8 w-8 p-0 text-gray-400">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="p-5 text-white">{children}</div>
                {footer && <div className="p-4 bg-black/20 border-t border-white/5">{footer}</div>}
            </div>
        </div>
    );
}

