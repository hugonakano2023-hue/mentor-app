/**
 * Pattern Detector — Analyzes 30 days of data to detect behavioral patterns
 */

import { getItemsForDate, getDayPlan, getCompletionForDate } from '@/lib/storage/day-plan-storage';
import { getActiveHabits, getHabitLogs, getStreak } from '@/lib/storage/habit-storage';
import { getWorkouts } from '@/lib/storage/workout-storage';
import { getTransactionsForMonth, getMonthSummary } from '@/lib/storage/finance-storage';
import { getTasks } from '@/lib/storage/task-storage';

export type Pattern = {
  type: 'positive' | 'negative' | 'neutral';
  category: 'habits' | 'tasks' | 'workout' | 'finance' | 'routine';
  message: string;
  confidence: number; // 0-1
  data: Record<string, unknown>;
};

function getLast30Dates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function getDayOfWeekName(day: number): string {
  const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return names[day] ?? 'Dia';
}

/**
 * Cross habit logs with day plan completion — sleep time vs task completion
 */
function detectSleepVsCompletion(): Pattern | null {
  const habits = getActiveHabits();
  const sleepHabit = habits.find(
    (h) => h.name.toLowerCase().includes('dorm') || h.name.toLowerCase().includes('sono') || h.name.toLowerCase().includes('sleep')
  );
  if (!sleepHabit) return null;

  const dates = getLast30Dates();
  let earlyDays = 0;
  let earlyCompletionSum = 0;
  let lateDays = 0;
  let lateCompletionSum = 0;

  for (const date of dates) {
    const logs = getHabitLogs(sleepHabit.id, 30);
    const dayLog = logs.find((l) => l.date === date);
    const completion = getCompletionForDate(date);
    if (!dayLog || completion.total === 0) continue;

    // For time type habits, check if before midnight (00:00)
    // For boolean, assume 'true' means slept early
    const sleptEarly = dayLog.value === 'true' ||
      (sleepHabit.type === 'time' && dayLog.value <= '00:00');

    if (sleptEarly) {
      earlyDays++;
      earlyCompletionSum += completion.percentage;
    } else {
      lateDays++;
      lateCompletionSum += completion.percentage;
    }
  }

  if (earlyDays >= 3 && lateDays >= 3) {
    const earlyAvg = Math.round(earlyCompletionSum / earlyDays);
    const lateAvg = Math.round(lateCompletionSum / lateDays);
    const diff = earlyAvg - lateAvg;

    if (Math.abs(diff) >= 10) {
      return {
        type: diff > 0 ? 'positive' : 'negative',
        category: 'habits',
        message: `Você completa ${earlyAvg}% das tarefas nos dias que dorme cedo vs ${lateAvg}% quando dorme tarde`,
        confidence: Math.min(1, (earlyDays + lateDays) / 20),
        data: { earlyAvg, lateAvg, earlyDays, lateDays },
      };
    }
  }

  return null;
}

/**
 * Detect day-of-week workout skip patterns
 */
function detectWorkoutSkipDay(): Pattern | null {
  const workouts = getWorkouts();
  const dates = getLast30Dates();

  const dayStats: Record<number, { total: number; skipped: number }> = {};
  for (let d = 0; d < 7; d++) {
    dayStats[d] = { total: 0, skipped: 0 };
  }

  for (const date of dates) {
    const dayOfWeek = new Date(date).getDay();
    const workout = workouts.find((w) => w.date === date);
    // Only count days where a workout was expected (has a workout record)
    if (workout) {
      dayStats[dayOfWeek].total++;
      if (!workout.completed) {
        dayStats[dayOfWeek].skipped++;
      }
    }
  }

  // Find day with highest skip rate (min 2 data points)
  let worstDay = -1;
  let worstSkipRate = 0;

  for (let d = 0; d < 7; d++) {
    const stats = dayStats[d];
    if (stats.total >= 2) {
      const skipRate = stats.skipped / stats.total;
      if (skipRate > worstSkipRate && skipRate >= 0.6) {
        worstDay = d;
        worstSkipRate = skipRate;
      }
    }
  }

  if (worstDay >= 0) {
    return {
      type: 'negative',
      category: 'workout',
      message: `Toda ${getDayOfWeekName(worstDay)} você pula o treino (${Math.round(worstSkipRate * 100)}% das vezes)`,
      confidence: Math.min(1, dayStats[worstDay].total / 4),
      data: { day: worstDay, dayName: getDayOfWeekName(worstDay), skipRate: worstSkipRate },
    };
  }

  return null;
}

/**
 * Compare category spending month-over-month
 */
function detectSpendingIncrease(): Pattern | null {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const prevDate = new Date(now);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentSummary = getMonthSummary(currentMonth);
  const prevSummary = getMonthSummary(prevMonth);

  // Scale current month proportionally if we're not at month end
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = dayOfMonth / daysInMonth;

  let biggestIncrease: { category: string; pct: number; current: number; prev: number } | null = null;

  for (const [category, currentAmount] of Object.entries(currentSummary.byCategory)) {
    // Only compare expenses
    const txs = getTransactionsForMonth(currentMonth).filter(
      (t) => t.category === category && t.type === 'despesa'
    );
    const currentExpense = txs.reduce((s, t) => s + t.amount, 0);

    const prevTxs = getTransactionsForMonth(prevMonth).filter(
      (t) => t.category === category && t.type === 'despesa'
    );
    const prevExpense = prevTxs.reduce((s, t) => s + t.amount, 0);

    if (prevExpense > 0 && monthProgress > 0.1) {
      const projectedCurrent = currentExpense / monthProgress;
      const pctIncrease = ((projectedCurrent - prevExpense) / prevExpense) * 100;

      if (pctIncrease >= 20 && (!biggestIncrease || pctIncrease > biggestIncrease.pct)) {
        biggestIncrease = {
          category,
          pct: Math.round(pctIncrease),
          current: Math.round(projectedCurrent),
          prev: Math.round(prevExpense),
        };
      }
    }
  }

  if (biggestIncrease) {
    return {
      type: 'negative',
      category: 'finance',
      message: `Seu gasto com ${biggestIncrease.category} aumentou ${biggestIncrease.pct}% este mês vs o anterior`,
      confidence: Math.min(1, monthProgress),
      data: biggestIncrease,
    };
  }

  return null;
}

/**
 * Detect best streak for any habit
 */
function detectBestStreak(): Pattern | null {
  const habits = getActiveHabits();
  let bestHabit: { name: string; streak: number } | null = null;

  for (const habit of habits) {
    const streak = getStreak(habit.id);
    if (streak >= 3 && (!bestHabit || streak > bestHabit.streak)) {
      bestHabit = { name: habit.name, streak };
    }
  }

  if (bestHabit) {
    return {
      type: 'positive',
      category: 'habits',
      message: `Você está no seu melhor streak de ${bestHabit.name}: ${bestHabit.streak} dias!`,
      confidence: Math.min(1, bestHabit.streak / 10),
      data: { habitName: bestHabit.name, streak: bestHabit.streak },
    };
  }

  return null;
}

/**
 * Detect routine block completion rate
 */
function detectRoutineBlockCompletion(): Pattern | null {
  const dates = getLast30Dates();
  let routineTotal = 0;
  let routineDone = 0;

  for (const date of dates) {
    const items = getItemsForDate(date);
    const routineItems = items.filter((i) => i.type === 'routine');
    routineTotal += routineItems.length;
    routineDone += routineItems.filter((i) => i.status === 'done').length;
  }

  if (routineTotal >= 5) {
    const completionRate = Math.round((routineDone / routineTotal) * 100);

    if (completionRate < 70) {
      // Find which block name is worst
      const blockCounts: Record<string, { total: number; done: number }> = {};
      for (const date of dates) {
        const items = getItemsForDate(date);
        for (const item of items) {
          if (item.type !== 'routine') continue;
          if (!blockCounts[item.title]) {
            blockCounts[item.title] = { total: 0, done: 0 };
          }
          blockCounts[item.title].total++;
          if (item.status === 'done') blockCounts[item.title].done++;
        }
      }

      let worstBlock = '';
      let worstRate = 100;
      for (const [name, stats] of Object.entries(blockCounts)) {
        if (stats.total >= 3) {
          const rate = Math.round((stats.done / stats.total) * 100);
          if (rate < worstRate) {
            worstBlock = name;
            worstRate = rate;
          }
        }
      }

      if (worstBlock) {
        return {
          type: 'negative',
          category: 'routine',
          message: `O bloco "${worstBlock}" é completado apenas ${worstRate}% das vezes`,
          confidence: Math.min(1, routineTotal / 20),
          data: { blockName: worstBlock, completionRate: worstRate },
        };
      }
    }
  }

  return null;
}

/**
 * Detect task categories that always miss deadlines
 */
function detectDeadlineMissPatterns(): Pattern | null {
  const tasks = getTasks();
  const today = new Date().toISOString().split('T')[0];

  const categoryStats: Record<string, { total: number; late: number }> = {};

  for (const task of tasks) {
    if (!task.deadline || !task.category) continue;
    if (task.status === 'backlog') continue;

    if (!categoryStats[task.category]) {
      categoryStats[task.category] = { total: 0, late: 0 };
    }
    categoryStats[task.category].total++;

    if (task.status === 'done' && task.completedAt) {
      // Was it completed after deadline?
      if (task.completedAt.split('T')[0] > task.deadline) {
        categoryStats[task.category].late++;
      }
    } else if (task.status !== 'done' && task.deadline < today) {
      // Still not done and past deadline
      categoryStats[task.category].late++;
    }
  }

  let worstCategory = '';
  let worstLateRate = 0;

  for (const [category, stats] of Object.entries(categoryStats)) {
    if (stats.total >= 3) {
      const lateRate = stats.late / stats.total;
      if (lateRate > worstLateRate && lateRate >= 0.5) {
        worstCategory = category;
        worstLateRate = lateRate;
      }
    }
  }

  if (worstCategory) {
    return {
      type: 'negative',
      category: 'tasks',
      message: `Suas tarefas de "${worstCategory}" sempre atrasam (${Math.round(worstLateRate * 100)}% passam do prazo)`,
      confidence: Math.min(1, categoryStats[worstCategory].total / 6),
      data: { category: worstCategory, lateRate: worstLateRate },
    };
  }

  return null;
}

/**
 * Run all pattern detectors and return results
 */
export function detectPatterns(): Pattern[] {
  const patterns: Pattern[] = [];

  const detectors = [
    detectSleepVsCompletion,
    detectWorkoutSkipDay,
    detectSpendingIncrease,
    detectBestStreak,
    detectRoutineBlockCompletion,
    detectDeadlineMissPatterns,
  ];

  for (const detector of detectors) {
    try {
      const result = detector();
      if (result) {
        patterns.push(result);
      }
    } catch {
      // Silently skip failed detectors
    }
  }

  // Sort by confidence descending
  return patterns.sort((a, b) => b.confidence - a.confidence);
}
