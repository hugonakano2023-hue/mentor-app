/**
 * XP Engine — Centralized XP logic
 *
 * Handles all XP awarding, streak updates, and perfect day checks.
 */

import { addXP, getXPState, updateStreak } from '@/lib/storage/xp-storage';
import { getCompletionForDate } from '@/lib/storage/day-plan-storage';
import { format } from 'date-fns';

export const XP_VALUES = {
  task: 10,
  task_with_goal: 15,
  construction_block: 25,
  workout: 20,
  perfect_day: 50,
  habits: 5,
  finance_review: 15,
} as const;

/** Call when a task is completed */
export function awardTaskXP(hasGoal: boolean): number {
  const amount = hasGoal ? XP_VALUES.task_with_goal : XP_VALUES.task;
  addXP(amount, hasGoal ? 'Tarefa com meta concluída' : 'Tarefa concluída');
  return amount;
}

/** Call when workout is completed */
export function awardWorkoutXP(): number {
  addXP(XP_VALUES.workout, 'Treino completado');
  return XP_VALUES.workout;
}

/** Call when all habits are logged for the day */
export function awardHabitsXP(): number {
  addXP(XP_VALUES.habits, 'Hábitos registrados');
  return XP_VALUES.habits;
}

/** Call when construction block is completed */
export function awardConstructionBlockXP(): number {
  addXP(XP_VALUES.construction_block, 'Bloco de construção completado');
  return XP_VALUES.construction_block;
}

/** Call when finance review is done */
export function awardFinanceReviewXP(): number {
  addXP(XP_VALUES.finance_review, 'Review financeiro semanal');
  return XP_VALUES.finance_review;
}

/** Check and award perfect day bonus (call at end of day or when last task is done) */
export function checkPerfectDay(): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  const completion = getCompletionForDate(today);
  if (completion && completion.percentage === 100) {
    addXP(XP_VALUES.perfect_day, 'Dia perfeito — 100% concluído!');
    return XP_VALUES.perfect_day;
  }
  return 0;
}

/** Update streak (call at end of day) */
export function updateDayStreak(): void {
  const today = format(new Date(), 'yyyy-MM-dd');
  const completion = getCompletionForDate(today);
  const pct = completion?.percentage ?? 0;
  updateStreak(today, pct);
}
