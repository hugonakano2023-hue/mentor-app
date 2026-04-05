'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Brain, Calendar, Heart, Target } from 'lucide-react';
import { CountdownCard } from "@/components/dashboard/countdown-card";
import { StatsRow } from "@/components/dashboard/stats-row";
import { DayPlanCard } from "@/components/dashboard/day-plan-card";
import { MentorPreview } from "@/components/dashboard/mentor-preview";
import { MiniCards } from "@/components/dashboard/mini-cards";
import { WeeklyView } from "@/components/dashboard/weekly-view";
import { seedInitialData } from "@/lib/storage/seed";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import { LabeledSkeleton } from "@/components/ui/labeled-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { DailyQuestsCard } from "@/components/gamification/daily-quests-card";
import { WeeklyRecapModal } from "@/components/gamification/weekly-recap-modal";
import { getActiveHabits, getLogsForDate } from "@/lib/storage/habit-storage";
import { getMonthSummary } from "@/lib/storage/finance-storage";
import { getUser } from "@/lib/storage/user-storage";
import { getGoals, calculateGoalProgress, getMilestones } from "@/lib/storage/goal-storage";
import { detectPatterns, type Pattern } from "@/lib/pattern-detector";

function HabitReminderCard() {
  const today = new Date().toISOString().split('T')[0];
  const habits = getActiveHabits();
  const logs = getLogsForDate(today);
  const loggedIds = new Set(logs.map((l) => l.habitId));
  const unlogged = habits.filter((h) => !loggedIds.has(h.id));

  if (habits.length === 0 || unlogged.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Link href="/habitos">
        <Card className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15 shrink-0">
              <Heart className="size-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Você ainda não registrou seus hábitos hoje
              </p>
              <p className="text-xs text-muted-foreground">
                {unlogged.length} de {habits.length} pendente{unlogged.length > 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-xs font-medium text-amber-400 shrink-0">
              Registrar agora →
            </span>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function BudgetAlertCard() {
  const user = getUser();
  if (!user || !user.fixedCosts || user.fixedCosts.length === 0) return null;

  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const summary = getMonthSummary(yearMonth);

  // Build a budget map from fixed costs
  const budgetMap: Record<string, number> = {};
  for (const cost of user.fixedCosts) {
    budgetMap[cost.name] = cost.amount;
  }

  // Find categories over budget
  const overBudget: { category: string; spent: number; limit: number }[] = [];
  for (const [category, spent] of Object.entries(summary.byCategory)) {
    const limit = budgetMap[category];
    if (limit && spent > limit) {
      overBudget.push({ category, spent, limit });
    }
  }

  if (overBudget.length === 0) return null;

  const worst = overBudget.sort((a, b) => (b.spent - b.limit) - (a.spent - a.limit))[0];
  const overAmount = worst.spent - worst.limit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Link href="/financeiro">
        <Card className="border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/15 shrink-0">
              <AlertTriangle className="size-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">
                {worst.category} estourou o orçamento
              </p>
              <p className="text-xs text-muted-foreground">
                R$ {overAmount.toLocaleString('pt-BR')} acima do limite de R$ {worst.limit.toLocaleString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function NextMilestoneCard() {
  const goals = getGoals();
  if (goals.length === 0) return null;

  let closestMilestone: { title: string; deadline: string; progress: number; goalTitle: string } | null = null;
  const today = new Date().toISOString().split('T')[0];

  for (const goal of goals) {
    const milestones = getMilestones(goal.id);
    for (const m of milestones) {
      if (m.progress >= 100) continue;
      if (!m.deadline) continue;
      if (m.deadline < today) continue;

      if (!closestMilestone || m.deadline < closestMilestone.deadline) {
        closestMilestone = {
          title: m.title,
          deadline: m.deadline,
          progress: m.progress,
          goalTitle: goal.title,
        };
      }
    }
  }

  // Fallback: show goal with closest deadline
  if (!closestMilestone) {
    for (const goal of goals) {
      const progress = calculateGoalProgress(goal.id);
      if (progress >= 100) continue;
      if (!goal.deadline) continue;
      if (goal.deadline < today) continue;

      if (!closestMilestone || goal.deadline < closestMilestone.deadline) {
        closestMilestone = {
          title: goal.title,
          deadline: goal.deadline,
          progress,
          goalTitle: goal.title,
        };
      }
    }
  }

  if (!closestMilestone) return null;

  const deadlineDate = new Date(closestMilestone.deadline);
  const fmtDeadline = `${deadlineDate.getDate()}/${deadlineDate.getMonth() + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Link href="/metas">
        <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-3 py-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 shrink-0">
              <Target className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Próximo marco: {closestMilestone.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {fmtDeadline} — {closestMilestone.progress}% concluído
              </p>
            </div>
            <div className="shrink-0">
              <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${closestMilestone.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function PatternInsightCard() {
  const [pattern, setPattern] = React.useState<Pattern | null>(null);

  React.useEffect(() => {
    try {
      const patterns = detectPatterns();
      if (patterns.length > 0) {
        // Pick a random one from top 3
        const top = patterns.slice(0, 3);
        setPattern(top[Math.floor(Math.random() * top.length)]);
      }
    } catch {
      // Ignore errors from pattern detection
    }
  }, []);

  if (!pattern) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="border-violet-500/30 bg-violet-500/5">
        <CardContent className="flex items-center gap-3 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 shrink-0">
            <Brain className="size-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-violet-400 font-medium mb-0.5">
              Insight do Mentor
            </p>
            <p className="text-sm font-medium">
              {pattern.message}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [seeded, setSeeded] = React.useState(false);

  // Seed initial data on first load if no data exists
  React.useEffect(() => {
    seedInitialData();
    setSeeded(true);
  }, []);

  if (!seeded) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
        <LabeledSkeleton label="Carregando seu dashboard..." lines={4} />
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visao geral do seu sistema de vida
          </p>
        </div>

        {/* Daily Quests */}
        <AnimatedList>
          <AnimatedListItem>
            <DailyQuestsCard />
          </AnimatedListItem>
        </AnimatedList>

        {/* Smart Intelligence Cards */}
        <div className="flex flex-col gap-3">
          <HabitReminderCard />
          <BudgetAlertCard />
          <NextMilestoneCard />
          <PatternInsightCard />
        </div>

        {/* Countdown — Full Width */}
        <AnimatedList>
          <AnimatedListItem>
            <CountdownCard />
          </AnimatedListItem>
        </AnimatedList>

        {/* Stats Row — 3 Columns */}
        <AnimatedList>
          <AnimatedListItem>
            <StatsRow />
          </AnimatedListItem>
        </AnimatedList>

        {/* Main Content — 2 Columns on Desktop */}
        <AnimatedList>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Day Plan */}
            <AnimatedListItem>
              <DayPlanCard />
            </AnimatedListItem>

            {/* Right Column: Mentor + Mini Cards + Weekly */}
            <AnimatedListItem>
              <div className="flex flex-col gap-4">
                <MentorPreview />
                <MiniCards />
                <WeeklyView />
              </div>
            </AnimatedListItem>
          </div>
        </AnimatedList>
      </div>

      {/* Weekly Recap Modal */}
      <WeeklyRecapModal />
    </AnimatedPage>
  );
}
