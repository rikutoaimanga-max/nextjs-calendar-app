
"use client";

import { useState, useEffect } from "react";

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (typeof window === "undefined" || !("Notification" in window)) return;

        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    };

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (permission === "granted") {
            new Notification(title, {
                icon: "/icon.png", // Fallback if no icon
                badge: "/icon.png",
                ...options,
            });
        }
    };

    return { permission, requestPermission, sendNotification };
}
