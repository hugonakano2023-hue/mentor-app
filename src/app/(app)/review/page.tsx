'use client';

import * as React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Dumbbell,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  Moon,
  Droplets,
  Brain,
  Hammer,
  ArrowRight,
  Sparkles,
  Heart,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getCompletionForDate } from '@/lib/storage/day-plan-storage';
import { getCompletedCount } from '@/lib/storage/workout-storage';
import { getWeekXP, getXPState } from '@/lib/storage/xp-storage';
import { getMonthSummary } from '@/lib/storage/finance-storage';
import {
  getActiveHabits,
  getLast7Days,
  getStreak,
} from '@/lib/storage/habit-storage';
import { getTasks } from '@/lib/storage/task-storage';

/* ─── Grade logic ──────────────────────────────────────────────────────── */

type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

function getGrade(pct: number): Grade {
  if (pct >= 90) return 'A';
  if (pct >= 75) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

const GRADE_STYLES: Record<Grade, { bg: string; text: string; glow: string }> =
  {
    A: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_25px_-5px_oklch(0.7_0.2_145/0.4)]',
    },
    B: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      glow: 'shadow-[0_0_25px_-5px_oklch(0.6_0.22_264/0.4)]',
    },
    C: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_25px_-5px_oklch(0.75_0.18_80/0.4)]',
    },
    D: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      glow: 'shadow-[0_0_25px_-5px_oklch(0.7_0.18_55/0.4)]',
    },
    F: {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      glow: 'shadow-[0_0_25px_-5px_oklch(0.65_0.25_25/0.4)]',
    },
  };

/* ─── Helper types ────────────────────────────────────────────────────── */

type ReviewData = {
  weekRange: string;
  completionPct: number;
  stats: {
    tasks: { done: number; total: number; pct: number };
    workouts: { done: number; total: number };
    streak: number;
    xp: number;
  };
  construction: { real: number; meta: number; pct: number };
  financial: {
    receita: number;
    despesa: number;
    saldo: number;
    topExpenses: { name: string; value: number }[];
  };
  habitsTable: {
    name: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  comparisons: {
    label: string;
    current: string;
    previous: string;
    trend: 'up' | 'down' | 'stable';
  }[];
};

function computeReviewData(): ReviewData {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Week range
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 6);
  const weekRange = `${startOfWeek.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  // Tasks: count done vs planned from last 7 days
  const allTasks = getTasks();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const recentTasks = allTasks.filter(
    (t) =>
      (t.status === 'done' || t.status === 'planned' || t.status === 'in_progress') &&
      t.createdAt >= sevenDaysAgoStr
  );
  const doneTasks = recentTasks.filter((t) => t.status === 'done').length;
  const totalTasks = recentTasks.length || 1;
  const taskPct = Math.round((doneTasks / totalTasks) * 100);

  // Plan completion for 7 days
  let totalPlanItems = 0;
  let donePlanItems = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const c = getCompletionForDate(dateStr);
    totalPlanItems += c.total;
    donePlanItems += c.done;
  }
  const completionPct =
    totalPlanItems > 0
      ? Math.round((donePlanItems / totalPlanItems) * 100)
      : taskPct;

  // Workouts
  const workoutsDone = getCompletedCount(7);

  // XP
  const weekXP = getWeekXP();
  const xpState = getXPState();

  // Financial
  const yearMonth = todayStr.slice(0, 7);
  const finance = getMonthSummary(yearMonth);
  const topExpenses = Object.entries(finance.byCategory)
    .filter(([cat]) => {
      // Only expenses (skip receita categories)
      return true;
    })
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, value]) => ({ name, value }));

  // Habits
  const habits = getActiveHabits();
  const habitsTable: ReviewData['habitsTable'] = habits.slice(0, 5).map((h) => {
    const last7 = getLast7Days(h.id);
    const done = last7.filter(Boolean).length;
    return {
      name: h.name,
      value: `${done}/7 dias`,
      icon: Heart,
    };
  });

  // Construction hours: estimate from completed "Bloco de Construção" items
  const constructionTasks = allTasks.filter(
    (t) =>
      t.status === 'done' &&
      t.completedAt &&
      t.completedAt >= sevenDaysAgoStr &&
      (t.category?.toLowerCase().includes('construção') ||
        t.category?.toLowerCase().includes('construcao') ||
        t.title?.toLowerCase().includes('construção') ||
        t.title?.toLowerCase().includes('construcao') ||
        t.title?.toLowerCase().includes('4leaftech') ||
        t.title?.toLowerCase().includes('4leaf'))
  );
  const constructionMinutes = constructionTasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 60),
    0
  );
  const constructionHours = Math.round(constructionMinutes / 60);

  // Previous week data for comparisons
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0];

  const prevTasks = allTasks.filter(
    (t) =>
      (t.status === 'done' || t.status === 'planned' || t.status === 'in_progress') &&
      t.createdAt >= fourteenDaysAgoStr &&
      t.createdAt < sevenDaysAgoStr
  );
  const prevDone = prevTasks.filter((t) => t.status === 'done').length;
  const prevTotal = prevTasks.length || 1;
  const prevTaskPct = Math.round((prevDone / prevTotal) * 100);

  let prevPlanDone = 0;
  let prevPlanTotal = 0;
  for (let i = 7; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const c = getCompletionForDate(dateStr);
    prevPlanTotal += c.total;
    prevPlanDone += c.done;
  }

  function trend(current: number, previous: number): 'up' | 'down' | 'stable' {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  }

  const comparisons: ReviewData['comparisons'] = [
    {
      label: 'Tarefas',
      current: `${taskPct}%`,
      previous: `${prevTaskPct}%`,
      trend: trend(taskPct, prevTaskPct),
    },
    {
      label: 'Treinos',
      current: `${workoutsDone}/5`,
      previous: '-',
      trend: workoutsDone >= 4 ? 'up' : workoutsDone >= 3 ? 'stable' : 'down',
    },
  ];

  // Add habit comparisons
  habits.slice(0, 3).forEach((h) => {
    const last7 = getLast7Days(h.id);
    const done = last7.filter(Boolean).length;
    comparisons.push({
      label: h.name,
      current: `${done}/7`,
      previous: '-',
      trend: done >= 5 ? 'up' : done >= 3 ? 'stable' : 'down',
    });
  });

  if (constructionHours > 0) {
    comparisons.push({
      label: 'Horas de construcao',
      current: `${constructionHours}h`,
      previous: '-',
      trend: constructionHours >= 15 ? 'up' : constructionHours >= 10 ? 'stable' : 'down',
    });
  }

  return {
    weekRange,
    completionPct,
    stats: {
      tasks: { done: doneTasks, total: totalTasks, pct: taskPct },
      workouts: { done: workoutsDone, total: 5 },
      streak: xpState.currentStreak,
      xp: weekXP,
    },
    construction: {
      real: constructionHours,
      meta: 20,
      pct: Math.min(100, Math.round((constructionHours / 20) * 100)),
    },
    financial: {
      receita: finance.receita,
      despesa: finance.despesa,
      saldo: finance.saldo,
      topExpenses,
    },
    habitsTable,
    comparisons,
  };
}

/* ─── Helper components ────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClassName,
  progress,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  iconClassName?: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-lg',
              iconClassName || 'bg-primary/15'
            )}
          >
            <Icon className="size-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div>
          <p className="font-mono text-xl font-bold tabular-nums">{value}</p>
          {sub && (
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          )}
        </div>
        {progress !== undefined && (
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')
    return <TrendingUp className="size-4 text-emerald-400" />;
  if (trend === 'down')
    return <TrendingDown className="size-4 text-red-400" />;
  return <Minus className="size-4 text-muted-foreground" />;
}

function formatBRL(value: number): string {
  return `R$${value.toLocaleString('pt-BR')}`;
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function ReviewPage() {
  const [data, setData] = React.useState<ReviewData | null>(null);

  React.useEffect(() => {
    setData(computeReviewData());
  }, []);

  if (!data) return null;

  const grade = getGrade(data.completionPct);
  const gradeStyle = GRADE_STYLES[grade];

  const mentorMessage = `Semana analisada. ${data.completionPct}% de conclusao geral.

${data.stats.tasks.done > 0 ? `Tarefas: ${data.stats.tasks.done} de ${data.stats.tasks.total} concluidas (${data.stats.tasks.pct}%).` : 'Nenhuma tarefa registrada esta semana.'}

${data.stats.workouts.done > 0 ? `Treinos: ${data.stats.workouts.done} de ${data.stats.workouts.total} completos. ${data.stats.workouts.done >= 4 ? 'Consistencia boa.' : 'Precisa melhorar a frequencia.'}` : 'Nenhum treino registrado.'}

${data.stats.streak > 0 ? `Streak de ${data.stats.streak} dias mostra que o sistema funciona quando voce decide executar.` : ''}

${data.financial.despesa > 0 ? `Financeiro: Receita ${formatBRL(data.financial.receita)}, Despesa ${formatBRL(data.financial.despesa)}, Saldo ${formatBRL(data.financial.saldo)}.` : ''}

Foque na proxima semana em manter a consistencia e atacar as prioridades primeiro.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Review Semanal
            </h1>
            <p className="text-sm text-muted-foreground">{data.weekRange}</p>
          </div>
        </div>

        {/* Grade Badge */}
        <div
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl border-2',
            gradeStyle.bg,
            gradeStyle.glow,
            grade === 'A' && 'border-emerald-500/40',
            grade === 'B' && 'border-blue-500/40',
            grade === 'C' && 'border-amber-500/40',
            grade === 'D' && 'border-orange-500/40',
            grade === 'F' && 'border-red-500/40'
          )}
        >
          <span
            className={cn('font-mono text-3xl font-black', gradeStyle.text)}
          >
            {grade}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Tarefas"
          value={`${data.stats.tasks.done}/${data.stats.tasks.total}`}
          sub={`${data.stats.tasks.pct}% concluidas`}
          iconClassName="bg-emerald-500/15 text-emerald-400"
          progress={data.stats.tasks.pct}
        />
        <StatCard
          icon={Dumbbell}
          label="Treinos"
          value={`${data.stats.workouts.done}/${data.stats.workouts.total}`}
          sub="completos"
          iconClassName="bg-red-500/15 text-red-400"
          progress={
            (data.stats.workouts.done / data.stats.workouts.total) * 100
          }
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${data.stats.streak} dias`}
          iconClassName="bg-streak/15 text-streak"
        />
        <StatCard
          icon={Zap}
          label="XP Ganho"
          value={`+${data.stats.xp} XP`}
          sub="esta semana"
          iconClassName="bg-xp/15 text-xp"
        />
      </div>

      {/* Horas de Construcao */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hammer className="size-4 text-primary" />
            Horas de Construcao
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-mono text-3xl font-bold tabular-nums">
                {data.construction.real}h
              </span>
              <span className="text-muted-foreground text-sm ml-1.5">
                / {data.construction.meta}h meta
              </span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'font-mono',
                data.construction.pct >= 80
                  ? 'border-emerald-500/30 text-emerald-400'
                  : 'border-amber-500/30 text-amber-400'
              )}
            >
              {data.construction.pct}%
            </Badge>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
              style={{ width: `${data.construction.pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {data.construction.pct}% da meta de horas de construcao
          </p>
        </CardContent>
      </Card>

      {/* Two column: Financial + Habits */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="size-4 text-amber-400" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Receita
                </p>
                <p className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                  {formatBRL(data.financial.receita)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Despesa
                </p>
                <p className="font-mono text-sm font-bold text-red-400 tabular-nums">
                  {formatBRL(data.financial.despesa)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Saldo
                </p>
                <p
                  className={cn(
                    'font-mono text-sm font-bold tabular-nums',
                    data.financial.saldo >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  )}
                >
                  {data.financial.saldo >= 0 ? '+' : ''}
                  {formatBRL(data.financial.saldo)}
                </p>
              </div>
            </div>

            {data.financial.topExpenses.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Maiores gastos
                  </p>
                  {data.financial.topExpenses.map((expense, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{expense.name}</span>
                      <span className="font-mono text-sm font-medium tabular-nums text-muted-foreground">
                        {formatBRL(expense.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Habits Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="size-4 text-primary" />
              Habitos da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.habitsTable.length > 0 ? (
              <div className="space-y-3">
                {data.habitsTable.map((habit, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <habit.icon className="size-4 text-muted-foreground" />
                      <span className="text-sm">{habit.name}</span>
                    </div>
                    <span className="font-mono text-sm font-medium tabular-nums">
                      {habit.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem habitos registrados esta semana.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparativo */}
      {data.comparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="size-4 text-primary" />
              Comparativo com Semana Anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.comparisons.map((comp, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                >
                  <span className="text-sm">{comp.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {comp.previous}
                    </span>
                    <TrendIcon trend={comp.trend} />
                    <span className="font-mono text-sm font-bold tabular-nums">
                      {comp.current}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mentor Message */}
      <Card className="relative overflow-hidden border-mentor/30">
        {/* Purple glow border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-mentor/10 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-20 -right-20 size-40 rounded-full bg-mentor/8 blur-3xl pointer-events-none" />

        <CardHeader className="relative">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-mentor/15">
              <Sparkles className="size-4 text-mentor" />
            </div>
            Mensagem do Mentor
          </CardTitle>
          <CardDescription>
            Analise personalizada da sua semana
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            {mentorMessage
              .split('\n\n')
              .filter((p) => p.trim())
              .map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-foreground/90"
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
