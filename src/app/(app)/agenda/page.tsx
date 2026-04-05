'use client';

import * as React from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Play,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AnimatedPage } from '@/components/ui/animated-page';
import { LabeledSkeleton } from '@/components/ui/labeled-skeleton';
import {
  getDayPlan,
  createDayPlan,
  getItemsForDate,
  createDayPlanItem,
  markItemDone,
  markItemSkipped,
  updateDayPlanItem,
  getCompletionForDate,
  type StoredDayPlanItem,
} from '@/lib/storage/day-plan-storage';
import { getRoutineBlocks } from '@/lib/storage/routine-storage';
import { getBacklog, completeTask, getTasks } from '@/lib/storage/task-storage';
import { getTodayWorkout } from '@/lib/storage/workout-storage';
import { addXP, getTodayXP, getLevel } from '@/lib/storage/xp-storage';
import { generateDayPlan, type PlanItem } from '@/lib/day-plan-engine';
import { getSession } from '@/lib/auth';
import { useGamification } from '@/lib/gamification-context';
import { checkAndUnlockAchievements } from '@/lib/storage/achievement-storage';
import { checkQuestCompletion } from '@/lib/daily-quests';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function useCurrentTime() {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

type FeedbackMessage = {
  text: string;
  type: 'success' | 'error';
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-secondary', text: 'text-muted-foreground', label: 'Pendente' },
  done: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Concluido' },
  skipped: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Pulado' },
};

const TYPE_STYLES: Record<string, { badge: string; label: string }> = {
  routine: { badge: 'bg-primary/15 text-primary border-primary/30', label: 'Rotina' },
  task: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'Tarefa' },
  workout: { badge: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'Treino' },
};

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  return date.toLocaleDateString('pt-BR', options);
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isToday(dateStr: string): boolean {
  return dateStr === getDateString(new Date());
}

export default function AgendaPage() {
  const gamification = useGamification();
  const [selectedDate, setSelectedDate] = React.useState(getDateString(new Date()));
  const [items, setItems] = React.useState<StoredDayPlanItem[]>([]);
  const [hasPlan, setHasPlan] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackMessage | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [todayXP, setTodayXP] = React.useState(0);
  const [completion, setCompletion] = React.useState({ done: 0, total: 0, percentage: 0 });

  // Load plan for selected date
  React.useEffect(() => {
    loadPlanForDate(selectedDate);
  }, [selectedDate]);

  // Auto-dismiss feedback
  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  function loadPlanForDate(date: string) {
    const plan = getDayPlan(date);
    setHasPlan(!!plan);
    if (plan) {
      const planItems = getItemsForDate(date);
      setItems(planItems);
    } else {
      setItems([]);
    }
    setCompletion(getCompletionForDate(date));
    setTodayXP(getTodayXP());
    setLoaded(true);
  }

  function showFeedback(text: string, type: 'success' | 'error' = 'success') {
    setFeedback({ text, type });
  }

  function navigateDate(direction: number) {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + direction);
    setSelectedDate(getDateString(current));
  }

  function goToToday() {
    setSelectedDate(getDateString(new Date()));
  }

  function handleGeneratePlan() {
    const session = getSession();
    const userId = session?.id ?? 'local';
    const date = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = date.getDay();

    // Get real data
    const routineBlocks = getRoutineBlocks();
    const backlogTasks = getBacklog().map((t) => ({
      id: t.id,
      title: t.title,
      estimatedMinutes: t.estimatedMinutes,
      priority: t.priority,
      category: t.category,
      deadline: t.deadline,
      goalId: t.goalId,
    }));

    const workout = getTodayWorkout();
    const workoutTitle = workout ? workout.type : undefined;

    // Generate the plan
    const planItems = generateDayPlan(dayOfWeek, routineBlocks, backlogTasks, workoutTitle);

    // Create day plan in storage
    const dayPlan = createDayPlan({
      userId,
      date: selectedDate,
      status: 'planned',
      xpEarned: 0,
      mentorMorningMessage: null,
      mentorNightMessage: null,
    });

    // Create plan items in storage
    for (let i = 0; i < planItems.length; i++) {
      const item = planItems[i];
      createDayPlanItem({
        dayPlanId: dayPlan.id,
        taskId: item.type === 'task' ? item.sourceId : null,
        routineBlockId: item.type === 'routine' ? item.sourceId : null,
        workoutId: item.type === 'workout' ? item.sourceId : null,
        title: item.title,
        startTime: item.startTime,
        endTime: item.endTime,
        status: 'pending',
        type: item.type,
        color: item.color,
        icon: item.icon,
        order: i,
      });
    }

    // Reload
    loadPlanForDate(selectedDate);
    showFeedback(`Plano gerado com ${planItems.length} itens`);
  }

  function handleMarkDone(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const levelBefore = getLevel().level;

    markItemDone(itemId);

    // If it's a task, also complete the task and add XP
    let xpAwarded = 10;
    if (item.type === 'task' && item.taskId) {
      const storedTask = getTasks().find((t) => t.id === item.taskId);
      if (storedTask && storedTask.status !== 'done') {
        completeTask(item.taskId);
        xpAwarded = storedTask.xpValue;
        addXP(xpAwarded, `Tarefa: ${item.title}`);
        showFeedback(`Concluido! +${xpAwarded} XP`);
      } else {
        addXP(10, `Item concluido: ${item.title}`);
        showFeedback('Concluido! +10 XP');
      }
    } else if (item.type === 'workout') {
      xpAwarded = 20;
      addXP(20, `Treino: ${item.title}`);
      showFeedback('Treino concluido! +20 XP');
    } else {
      addXP(10, `Rotina: ${item.title}`);
      showFeedback('Concluido! +10 XP');
    }

    // Visual gamification feedback
    gamification.showXPToast(xpAwarded, item.title);

    // Check for level up
    const levelAfter = getLevel().level;
    if (levelAfter > levelBefore) {
      gamification.showLevelUp(levelBefore, levelAfter);
      gamification.showConfetti();
    }

    // Check achievements
    const newAchievements = checkAndUnlockAchievements();
    for (const ach of newAchievements) {
      gamification.showAchievement(ach);
    }

    // Check quest completion
    checkQuestCompletion();

    loadPlanForDate(selectedDate);
  }

  function handleMarkSkipped(itemId: string) {
    markItemSkipped(itemId);
    showFeedback('Item pulado');
    loadPlanForDate(selectedDate);
  }

  function handleMarkInProgress(itemId: string) {
    updateDayPlanItem(itemId, { status: 'pending' });
    loadPlanForDate(selectedDate);
  }

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <CalendarDays className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Agenda</h1>
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <LabeledSkeleton label="Montando seu plano do dia..." lines={5} />
      </div>
    );
  }

  const now = useCurrentTime();
  const currentTimeStr = formatTime(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const nowLineRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to "now" line on mount
  React.useEffect(() => {
    if (nowLineRef.current && scrollRef.current) {
      const container = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (container) {
        const lineTop = nowLineRef.current.offsetTop;
        container.scrollTop = Math.max(0, lineTop - 100);
      }
    }
  }, [items]);

  // Determine where "now" falls in the item list
  const nowInsertIndex = React.useMemo(() => {
    if (!isToday(selectedDate) || items.length === 0) return -1;
    for (let i = 0; i < items.length; i++) {
      const itemStart = timeToMinutes(items[i].startTime);
      if (nowMinutes < itemStart) return i;
    }
    return items.length;
  }, [items, nowMinutes, selectedDate]);

  return (
    <AnimatedPage>
    <div className="space-y-6">
      {/* Feedback toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-slide-in-top ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <X className="size-4" />
          )}
          {feedback.text}
          <button onClick={() => setFeedback(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <CalendarDays className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Agenda</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {formatDateDisplay(selectedDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="btn-press" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant={isToday(selectedDate) ? 'default' : 'outline'}
            size="sm"
            className="btn-press"
            onClick={goToToday}
          >
            Hoje
          </Button>
          <Button variant="outline" size="icon" className="btn-press" onClick={() => navigateDate(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {!hasPlan && (
          <Button onClick={handleGeneratePlan} className="gap-1.5 btn-press">
            <Sparkles className="size-4" />
            Gerar Plano
          </Button>
        )}
      </div>

      {/* No Plan State */}
      {!hasPlan && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <CalendarDays className="size-8 text-primary/60" />
          </div>
          <h3 className="font-semibold">Nenhum plano para este dia</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Gere um plano automatico baseado na sua rotina e tarefas do backlog.
          </p>
          <Button className="mt-4 gap-1.5 btn-press" onClick={handleGeneratePlan}>
            <Sparkles className="size-4" />
            Gerar Plano do Dia
          </Button>
        </div>
      )}

      {/* Timeline */}
      {hasPlan && items.length > 0 && (
        <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card card-hover">
          <CardContent className="p-0">
            <ScrollArea ref={scrollRef} className="max-h-[600px]">
              <div className="flex flex-col">
                {items.map((item, idx) => {
                  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
                  const typeStyle = TYPE_STYLES[item.type] ?? TYPE_STYLES.routine;
                  const itemStart = timeToMinutes(item.startTime);
                  const isPast = isToday(selectedDate) && nowMinutes > itemStart;

                  return (
                    <React.Fragment key={item.id}>
                      {/* "Now" line — rendered before the item where now falls */}
                      {isToday(selectedDate) && nowInsertIndex === idx && (
                        <div ref={nowLineRef} className="relative my-1 mx-4">
                          <div className="absolute left-0 right-0 h-0.5 bg-red-500/80" />
                          <div className="absolute -left-1 -top-1 size-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="absolute left-6 -top-2.5 text-xs font-mono text-red-400">
                            {currentTimeStr}
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          'group flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-secondary/30',
                          item.status === 'done' && 'opacity-60',
                          item.status === 'skipped' && 'opacity-40',
                          isPast && item.status === 'pending' && 'opacity-60',
                          idx !== items.length - 1 && 'border-b border-border/30'
                        )}
                      >
                        {/* Time */}
                        <div className="w-20 shrink-0 text-right">
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {item.startTime}
                          </span>
                          <br />
                          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                            {item.endTime}
                          </span>
                        </div>

                        {/* Color bar */}
                        <div
                          className="w-1 self-stretch rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />

                        {/* Icon */}
                        <span className="text-lg shrink-0">{item.icon}</span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-medium truncate',
                              item.status === 'done' && 'line-through text-muted-foreground',
                              item.status === 'skipped' && 'line-through text-muted-foreground'
                            )}
                          >
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] h-4 px-1.5 border', typeStyle.badge)}
                            >
                              {typeStyle.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] h-4 px-1.5', statusStyle.bg, statusStyle.text)}
                            >
                              {statusStyle.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {item.status === 'pending' && (
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleMarkDone(item.id)}
                              title="Concluir"
                              className="hover:bg-emerald-500/15 hover:text-emerald-400 btn-press"
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleMarkSkipped(item.id)}
                              title="Pular"
                              className="hover:bg-red-500/15 hover:text-red-400 btn-press"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        )}
                        {(item.status === 'done' || item.status === 'skipped') && (
                          <div className="shrink-0">
                            {item.status === 'done' ? (
                              <CheckCircle2 className="size-4 text-emerald-400 animate-bounce-check" />
                            ) : (
                              <X className="size-4 text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                {/* "Now" line at the end if all items are past */}
                {isToday(selectedDate) && nowInsertIndex === items.length && (
                  <div ref={nowLineRef} className="relative my-1 mx-4">
                    <div className="absolute left-0 right-0 h-0.5 bg-red-500/80" />
                    <div className="absolute -left-1 -top-1 size-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="absolute left-6 -top-2.5 text-xs font-mono text-red-400">
                      {currentTimeStr}
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Bottom Stats */}
      {hasPlan && (
        <div className="grid grid-cols-3 gap-3">
          {/* Completed */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm card-hover">
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-xs font-medium text-muted-foreground">Concluidas</span>
              </div>
              <p className="font-mono text-2xl font-black tracking-tighter text-emerald-400">
                {completion.done}/{completion.total}
              </p>
            </CardContent>
          </Card>

          {/* Percentage */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm card-hover">
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Progresso</span>
              </div>
              <p className="font-mono text-2xl font-black tracking-tighter text-primary">
                {completion.percentage}%
              </p>
            </CardContent>
          </Card>

          {/* XP */}
          <Card className="border-0 bg-card/80 backdrop-blur-sm card-hover">
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Zap className="size-4 text-xp" />
                <span className="text-xs font-medium text-muted-foreground">XP Hoje</span>
              </div>
              <p className="font-mono text-2xl font-black tracking-tighter text-xp">
                {todayXP}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </AnimatedPage>
  );
}
