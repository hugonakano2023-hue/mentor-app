"use client";

import * as React from "react";
import {
  ListTodo,
  Dumbbell,
  Wallet,
  Heart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getItemsForDate } from "@/lib/storage/day-plan-storage";
import { getTodayWorkout } from "@/lib/storage/workout-storage";
import { getMonthSummary } from "@/lib/storage/finance-storage";
import { getLogsForDate } from "@/lib/storage/habit-storage";
import { getActiveHabits } from "@/lib/storage/habit-storage";

type MiniCardData = {
  label: string;
  value: string;
  detail?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  trend?: "up" | "down";
  progress?: number;
};

function useMiniCardsData(): MiniCardData[] {
  const [cards, setCards] = React.useState<MiniCardData[]>([]);

  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.substring(0, 7);

    // Next task: first pending task from today's plan
    const planItems = getItemsForDate(today);
    const nextTask = planItems.find(
      (i) => i.status === "pending" && i.type === "task"
    );
    const nextTaskCard: MiniCardData = {
      label: "Proxima tarefa",
      value: nextTask?.title ?? "Nenhuma tarefa",
      detail: nextTask?.startTime ?? undefined,
      icon: ListTodo,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    };

    // Workout
    const workout = getTodayWorkout();
    const workoutCard: MiniCardData = {
      label: "Treino",
      value: workout?.type ?? "Sem treino hoje",
      detail: workout ? "17:30" : undefined,
      icon: Dumbbell,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
    };

    // Balance
    const summary = getMonthSummary(currentMonth);
    const saldoFormatted = summary.saldo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const balanceCard: MiniCardData = {
      label: "Saldo do mes",
      value: saldoFormatted,
      icon: Wallet,
      iconColor: "text-xp",
      iconBg: "bg-xp/10",
      trend: summary.saldo >= 0 ? "up" : "down",
    };

    // Habits
    const activeHabits = getActiveHabits();
    const todayLogs = getLogsForDate(today);
    const habitsLogged = todayLogs.length;
    const habitsTotal = activeHabits.length;
    const habitsPercent =
      habitsTotal > 0 ? Math.round((habitsLogged / habitsTotal) * 100) : 0;
    const habitsCard: MiniCardData = {
      label: "Habitos",
      value: `${habitsLogged}/${habitsTotal} registrados`,
      icon: Heart,
      iconColor: "text-[oklch(0.7_0.2_340)]",
      iconBg: "bg-[oklch(0.7_0.2_340)]/10",
      progress: habitsPercent,
    };

    setCards([nextTaskCard, workoutCard, balanceCard, habitsCard]);
  }, []);

  return cards;
}

function MiniCard({ data }: { data: MiniCardData }) {
  const Icon = data.icon;

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card card-hover">
      <CardContent className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            data.iconBg
          )}
        >
          <Icon className={cn("size-5", data.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
            {data.label}
          </p>
          <p className="text-sm font-semibold truncate">{data.value}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {data.detail && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="size-2.5" />
                {data.detail}
              </span>
            )}
            {data.trend === "up" && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-xp">
                <ArrowUpRight className="size-3" />
                positivo
              </span>
            )}
            {data.trend === "down" && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-destructive">
                <ArrowDownRight className="size-3" />
                negativo
              </span>
            )}
            {data.progress !== undefined && (
              <div className="flex items-center gap-1.5 flex-1">
                <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[oklch(0.7_0.2_340)] transition-all"
                    style={{ width: `${data.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                  {data.progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MiniCards() {
  const cards = useMiniCardsData();

  if (cards.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-secondary/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((data) => (
        <MiniCard key={data.label} data={data} />
      ))}
    </div>
  );
}
