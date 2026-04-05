/**
 * Habit Storage
 */
import {
  type StoredEntity,
  getCollection,
  setCollection,
  create,
  update,
  remove,
  STORAGE_KEYS,
} from './index';

export type StoredHabit = StoredEntity & {
  userId: string;
  name: string;
  type: 'boolean' | 'number' | 'time';
  dailyGoal: string | null;
  icon: string;
  active: boolean;
};

export type StoredHabitLog = StoredEntity & {
  habitId: string;
  date: string;
  value: string; // 'true'/'false' for boolean, number string for number, 'HH:mm' for time
  notes: string;
};

const HABIT_KEY = STORAGE_KEYS.HABITS;
const LOG_KEY = STORAGE_KEYS.HABIT_LOGS;

// --- Habits ---

export function getHabits(): StoredHabit[] {
  return getCollection<StoredHabit>(HABIT_KEY);
}

export function getActiveHabits(): StoredHabit[] {
  return getHabits().filter((h) => h.active);
}

export function createHabit(
  data: Omit<StoredHabit, 'id' | 'createdAt'>
): StoredHabit {
  return create<StoredHabit>(HABIT_KEY, data);
}

export function updateHabit(
  id: string,
  data: Partial<StoredHabit>
): StoredHabit | null {
  return update<StoredHabit>(HABIT_KEY, id, data);
}

export function deleteHabit(id: string): boolean {
  return remove<StoredHabit>(HABIT_KEY, id);
}

// --- Habit Logs ---

export function getHabitLogs(habitId: string, days?: number): StoredHabitLog[] {
  let logs = getCollection<StoredHabitLog>(LOG_KEY).filter(
    (l) => l.habitId === habitId
  );

  if (days !== undefined) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    logs = logs.filter((l) => l.date >= cutoffStr);
  }

  return logs.sort((a, b) => b.date.localeCompare(a.date));
}

export function logHabit(
  habitId: string,
  date: string,
  value: string,
  notes: string = ''
): StoredHabitLog {
  // Update existing log for the same habit+date, or create new
  const logs = getCollection<StoredHabitLog>(LOG_KEY);
  const existingIndex = logs.findIndex(
    (l) => l.habitId === habitId && l.date === date
  );

  if (existingIndex !== -1) {
    logs[existingIndex] = { ...logs[existingIndex], value, notes };
    setCollection(LOG_KEY, logs);
    return logs[existingIndex];
  }

  return create<StoredHabitLog>(LOG_KEY, { habitId, date, value, notes });
}

export function getLogsForDate(date: string): StoredHabitLog[] {
  return getCollection<StoredHabitLog>(LOG_KEY).filter(
    (l) => l.date === date
  );
}

export function getStreak(habitId: string): number {
  const logs = getHabitLogs(habitId);
  if (logs.length === 0) return 0;

  // Sort ascending by date
  const sorted = [...logs]
    .filter((l) => l.value === 'true' || parseFloat(l.value) > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const hasLog = sorted.some((l) => l.date === dateStr);
    if (hasLog) {
      streak++;
    } else {
      // Allow skipping today if not logged yet
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}

export function getLast7Days(habitId: string): boolean[] {
  const logs = getHabitLogs(habitId, 7);
  const result: boolean[] = [];

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find((l) => l.date === dateStr);
    result.push(
      log ? log.value === 'true' || parseFloat(log.value) > 0 : false
    );
  }

  return result;
}
