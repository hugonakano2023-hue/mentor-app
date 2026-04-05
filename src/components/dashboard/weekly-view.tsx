"use client";

import * as React from "react";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getWeeklyCompletion } from "@/lib/storage/day-plan-storage";

type DayData = {
  date: Date;
  label: string;
  shortLabel: string;
  percent: number;
};

function useWeekData(): DayData[] {
  const [data, setData] = React.useState<DayData[]>([]);

  React.useEffect(() => {
    const completion = getWeeklyCompletion();
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dateStr = date.toISOString().split("T")[0];
      const dayCompletion = completion.find((c) => c.date === dateStr);

      return {
        date,
        label: format(date, "EEEE", { locale: ptBR }),
        shortLabel: format(date, "EEE", { locale: ptBR }).replace(".", ""),
        percent: dayCompletion?.percentage ?? 0,
      };
    });

    setData(weekDays);
  }, []);

  return data;
}

function getIntensityClass(percent: number, isCurrent: boolean): string {
  if (percent === 0) return "bg-secondary/50";
  if (percent < 40) return "bg-primary/20";
  if (percent < 60) return "bg-primary/40";
  if (percent < 80) return "bg-primary/60";
  return isCurrent
    ? "bg-gradient-to-br from-primary to-accent"
    : "bg-primary/80";
}

function DayBlock({ day }: { day: DayData }) {
  const isCurrent = isToday(day.date);
  const isPast = day.date < new Date() && !isCurrent;
  const isFuture = day.date > new Date() && !isCurrent;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Day label */}
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-wider",
          isCurrent ? "text-primary font-bold" : "text-muted-foreground"
        )}
      >
        {day.shortLabel}
      </span>

      {/* Block */}
      <div
        className={cn(
          "relative flex size-11 items-center justify-center rounded-lg transition-all duration-300",
          getIntensityClass(day.percent, isCurrent),
          isCurrent && "ring-2 ring-primary/50 scale-110",
          isFuture && "opacity-40"
        )}
      >
        <span
          className={cn(
            "font-mono text-xs font-bold tabular-nums",
            day.percent === 0
              ? "text-muted-foreground/50"
              : day.percent >= 60
                ? "text-white"
                : "text-foreground/70"
          )}
        >
          {day.percent > 0 ? `${day.percent}` : "-"}
        </span>

        {/* Current day indicator */}
        {isCurrent && (
          <span className="absolute -bottom-1 size-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </div>

      {/* Date number */}
      <span
        className={cn(
          "text-[10px] font-mono tabular-nums",
          isCurrent
            ? "text-primary font-bold"
            : isPast
              ? "text-muted-foreground"
              : "text-muted-foreground/50"
        )}
      >
        {format(day.date, "d")}
      </span>
    </div>
  );
}

export function WeeklyView() {
  const weekData = useWeekData();

  const daysWithData = weekData.filter((d) => d.percent > 0);
  const weekAvg =
    daysWithData.length > 0
      ? Math.round(
          daysWithData.reduce((sum, d) => sum + d.percent, 0) / daysWithData.length
        )
      : 0;

  if (weekData.length === 0) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card">
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <CardTitle>Visao Semanal</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Media:{" "}
          <span className="font-mono font-bold text-primary tabular-nums">
            {weekAvg}%
          </span>
        </p>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {weekData.map((day) => (
            <DayBlock key={day.shortLabel} day={day} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-secondary/50" />
            <span className="text-[10px] text-muted-foreground">0%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-primary/20" />
            <span className="text-[10px] text-muted-foreground">1-39%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-primary/40" />
            <span className="text-[10px] text-muted-foreground">40-59%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-primary/60" />
            <span className="text-[10px] text-muted-foreground">60-79%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-primary/80" />
            <span className="text-[10px] text-muted-foreground">80%+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
