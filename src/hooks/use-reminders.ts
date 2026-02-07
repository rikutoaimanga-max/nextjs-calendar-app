
"use client";

import { useEffect, useRef } from "react";
import { isSameMinute } from "date-fns";
import { CalendarEvent } from "@/types";
import { useNotifications } from "@/hooks/use-notifications";

export function useReminders(events: CalendarEvent[]) {
    const { sendNotification, permission } = useNotifications();
    // Keep track of notified events to avoid double notifications in same minute
    const notifiedEventsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (permission !== "granted") return;

        const checkReminders = () => {
            const now = new Date();

            events.forEach((event) => {
                if (!event.reminderTimes || event.reminderTimes.length === 0) return;

                event.reminderTimes.forEach((reminderTime) => {
                    // Check if reminder time is same minute as now
                    if (isSameMinute(reminderTime, now)) {
                        // Create unique tag for this specific reminder instance
                        const reminderTag = `${event.id}-${reminderTime.toISOString()}`;

                        // Check if already notified for this specific reminder
                        if (notifiedEventsRef.current.has(reminderTag)) return;

                        // Send notification
                        sendNotification("予定の時間です", {
                            body: `${event.title} (${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                            tag: reminderTag
                        });

                        // Mark as notified
                        notifiedEventsRef.current.add(reminderTag);
                    }
                });
            });

        };

        // Check every 30 seconds to be safe, but isSameMinute handles the logic
        const intervalId = setInterval(checkReminders, 30000); // 30s check

        // Initial check
        checkReminders();

        return () => clearInterval(intervalId);
    }, [events, permission, sendNotification]);
}
