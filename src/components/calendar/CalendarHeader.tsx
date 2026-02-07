
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

export function CalendarHeader({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onToday,
}: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between py-6 px-4 bg-background/60 backdrop-blur-md sticky top-0 z-20 border-b border-white/5 shadow-sm">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                    {format(currentDate, "yyyy年 M月", { locale: ja })}
                </h2>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onToday} className="text-xs mr-2 bg-transparent border-primary/30 text-primary hover:bg-primary/10">
                    今日
                </Button>
                <div className="flex bg-card/50 rounded-md border border-white/5 p-0.5">
                    <Button variant="ghost" size="sm" onClick={onPrevMonth} aria-label="先月" className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onNextMonth} aria-label="来月" className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

