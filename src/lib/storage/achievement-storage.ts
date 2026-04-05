/**
 * Achievement Storage
 */
import { getValue, setValue, STORAGE_KEYS } from './index';
import { getXPState } from './xp-storage';
import { getTasks } from './task-storage';
import { getWorkouts } from './workout-storage';
import { getDebts } from './finance-storage';
import { getHabitLogs, getActiveHabits } from './habit-storage';
import { getCompletionForDate } from './day-plan-storage';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  category: 'streak' | 'tasks' | 'workout' | 'finance' | 'habits' | 'special';
};

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_day', name: 'Primeiro Dia', description: 'Complete seu primeiro dia', icon: '\u{1F3AF}', category: 'special' },
  { id: 'streak_3', name: 'Em Chamas', description: '3 dias de streak', icon: '\u{1F525}', category: 'streak' },
  { id: 'streak_7', name: 'Semana de Fogo', description: '7 dias de streak', icon: '\u{1F525}', category: 'streak' },
  { id: 'streak_30', name: 'Imparavel', description: '30 dias de streak', icon: '\u{1F48E}', category: 'streak' },
  { id: 'perfect_day', name: 'Dia Perfeito', description: '100% do plano em um dia', icon: '\u{1F3C6}', category: 'special' },
  { id: 'perfect_week', name: 'Semana Perfeita', description: '7 dias com >80% conclusao', icon: '\u2B50', category: 'special' },
  { id: 'tasks_10', name: 'Executor', description: 'Complete 10 tarefas', icon: '\u2705', category: 'tasks' },
  { id: 'tasks_50', name: 'Maquina', description: 'Complete 50 tarefas', icon: '\u26A1', category: 'tasks' },
  { id: 'tasks_100', name: 'Lenda', description: 'Complete 100 tarefas', icon: '\u{1F451}', category: 'tasks' },
  { id: 'workout_10', name: 'Atleta', description: '10 treinos completados', icon: '\u{1F4AA}', category: 'workout' },
  { id: 'workout_30', name: 'Guerreiro', description: '30 treinos completados', icon: '\u{1F94A}', category: 'workout' },
  { id: 'debt_cleared', name: 'Livre', description: 'Quite uma divida', icon: '\u{1F4B0}', category: 'finance' },
  { id: 'all_debts', name: 'Liberdade Financeira', description: 'Quite todas as dividas', icon: '\u{1F3E6}', category: 'finance' },
  { id: 'habits_7', name: 'Consistente', description: '7 dias registrando habitos', icon: '\u{1F4CA}', category: 'habits' },
  { id: 'level_5', name: 'Nivel 5', description: 'Alcance o nivel 5', icon: '\u{1F33F}', category: 'special' },
  { id: 'level_10', name: 'Nivel 10', description: 'Alcance o nivel 10', icon: '\u{1F333}', category: 'special' },
  { id: 'construction_5', name: 'Construtor', description: '5 blocos de construcao completados', icon: '\u{1F528}', category: 'tasks' },
];

const ACHIEVEMENT_KEY = 'mentor_achievements';

function getStoredAchievements(): Record<string, string> {
  return getValue<Record<string, string>>(ACHIEVEMENT_KEY) ?? {};
}

function setStoredAchievements(data: Record<string, string>): void {
  setValue(ACHIEVEMENT_KEY, data);
}

export function getAchievements(): Achievement[] {
  const stored = getStoredAchievements();
  return ACHIEVEMENT_DEFINITIONS.map((def) => ({
    ...def,
    unlockedAt: stored[def.id] ?? null,
  }));
}

export function unlockAchievement(id: string): Achievement | null {
  const stored = getStoredAchievements();
  if (stored[id]) return null; // already unlocked

  const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
  if (!def) return null;

  stored[id] = new Date().toISOString();
  setStoredAchievements(stored);

  return { ...def, unlockedAt: stored[id] };
}

export function checkAndUnlockAchievements(): Achievement[] {
  const newly: Achievement[] = [];
  const xpState = getXPState();
  const doneTasks = getTasks().filter((t) => t.status === 'done');
  const completedWorkouts = getWorkouts().filter((w) => w.completed);
  const debts = getDebts();
  const today = new Date().toISOString().split('T')[0];
  const completion = getCompletionForDate(today);

  // Helper
  function tryUnlock(id: string) {
    const result = unlockAchievement(id);
    if (result) newly.push(result);
  }

  // first_day: any task or plan item completed
  if (doneTasks.length > 0 || (completion && completion.done > 0)) {
    tryUnlock('first_day');
  }

  // Streak achievements
  if (xpState.currentStreak >= 3) tryUnlock('streak_3');
  if (xpState.currentStreak >= 7) tryUnlock('streak_7');
  if (xpState.currentStreak >= 30) tryUnlock('streak_30');

  // Perfect day
  if (completion && completion.percentage === 100 && completion.total > 0) {
    tryUnlock('perfect_day');
  }

  // Perfect week: check last 7 days
  let goodDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayCompletion = getCompletionForDate(dateStr);
    if (dayCompletion && dayCompletion.percentage >= 80 && dayCompletion.total > 0) {
      goodDays++;
    }
  }
  if (goodDays >= 7) tryUnlock('perfect_week');

  // Task count achievements
  if (doneTasks.length >= 10) tryUnlock('tasks_10');
  if (doneTasks.length >= 50) tryUnlock('tasks_50');
  if (doneTasks.length >= 100) tryUnlock('tasks_100');

  // Workout achievements
  if (completedWorkouts.length >= 10) tryUnlock('workout_10');
  if (completedWorkouts.length >= 30) tryUnlock('workout_30');

  // Debt achievements
  const clearedDebts = debts.filter((d) => d.paidAmount >= d.totalAmount);
  if (clearedDebts.length > 0) tryUnlock('debt_cleared');
  if (debts.length > 0 && clearedDebts.length === debts.length) tryUnlock('all_debts');

  // Habit logging streak (7 unique days with logs)
  const allLogs = getActiveHabits().flatMap((h) => getHabitLogs(h.id, 30));
  const uniqueDays = new Set(allLogs.map((l) => l.date));
  if (uniqueDays.size >= 7) tryUnlock('habits_7');

  // Level achievements
  if (xpState.level >= 5) tryUnlock('level_5');
  if (xpState.level >= 10) tryUnlock('level_10');

  // Construction blocks: count routine items marked done (from day plan items of type 'routine')
  // We use the XP history to approximate construction block completions
  const constructionXPEntries = xpState.xpHistory.filter(
    (h) => h.reason.toLowerCase().includes('bloco de constru')
  );
  if (constructionXPEntries.length >= 5) tryUnlock('construction_5');

  return newly;
}

export function getUnlockedCount(): { unlocked: number; total: number } {
  const stored = getStoredAchievements();
  return {
    unlocked: Object.keys(stored).length,
    total: ACHIEVEMENT_DEFINITIONS.length,
  };
}
