"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getItemsForDate,
  markItemDone,
  type StoredDayPlanItem,
} from "@/lib/storage/day-plan-storage";
import { completeTask, getTasks } from "@/lib/storage/task-storage";
import { addXP } from "@/lib/storage/xp-storage";

function PlanItemRow({
  item,
  onToggle,
}: {
  item: StoredDayPlanItem;
  onToggle: (id: string, done: boolean) => void;
}) {
  const checked = item.status === "done";

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
        "hover:bg-secondary/50",
        checked && "opacity-60"
      )}
    >
      {/* Time */}
      <div className="w-12 shrink-0 text-right">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {item.startTime}
        </span>
      </div>

      {/* Timeline dot */}
      <div className="relative flex flex-col items-center">
        <div
          className="size-2.5 rounded-full ring-2 ring-background transition-colors"
          style={{ backgroundColor: item.color }}
        />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={checked}
        onCheckedChange={(val) => onToggle(item.id, val === true)}
        className="shrink-0"
      />

      {/* Icon */}
      <span className="text-lg shrink-0">{item.icon}</span>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate transition-all",
            checked && "line-through text-muted-foreground"
          )}
        >
          {item.title}
        </p>
        {item.endTime && (
          <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
            {item.startTime} - {item.endTime}
          </p>
        )}
      </div>

      {/* Type badge */}
      {item.type === "task" && (
        <Badge variant="outline" className="text-[10px] shrink-0 border-primary/30 text-primary">
          Tarefa
        </Badge>
      )}
      {item.type === "workout" && (
        <Badge variant="outline" className="text-[10px] shrink-0 border-red-500/30 text-red-400">
          Treino
        </Badge>
      )}
    </div>
  );
}

export function DayPlanCard() {
  const [items, setItems] = React.useState<StoredDayPlanItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  React.useEffect(() => {
    const planItems = getItemsForDate(todayStr);
    setItems(planItems);
    setLoaded(true);
  }, [todayStr]);

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const doneCount = items.filter((i) => i.status === "done").length;

  function handleToggle(itemId: string, done: boolean) {
    if (done) {
      markItemDone(itemId);

      // Find the item to check if it's a task
      const item = items.find((i) => i.id === itemId);
      if (item?.type === "task" && item.taskId) {
        const storedTask = getTasks().find((t) => t.id === item.taskId);
        if (storedTask && storedTask.status !== "done") {
          completeTask(item.taskId);
          addXP(storedTask.xpValue, `Tarefa: ${item.title}`);
        }
      } else {
        addXP(10, `Item concluido: ${item?.title ?? "item"}`);
      }
    }

    // Reload items
    const updated = getItemsForDate(todayStr);
    setItems(updated);
  }

  if (!loaded) {
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
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          <CardTitle>Plano do Dia</CardTitle>
        </div>
        <CardAction>
          <Badge variant="secondary" className="font-mono tabular-nums text-[10px]">
            {doneCount}/{items.length}
          </Badge>
        </CardAction>
        <p className="text-xs text-muted-foreground capitalize col-span-2">
          {today}
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="size-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum plano para hoje
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Va para a Agenda e gere um plano
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[420px]">
            <div className="flex flex-col gap-0.5 py-2">
              {items.map((item) => (
                <PlanItemRow key={item.id} item={item} onToggle={handleToggle} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
