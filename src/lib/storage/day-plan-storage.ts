/**
 * Day Plan Storage
 */
import {
  type StoredEntity,
  getCollection,
  getById,
  create,
  update,
  STORAGE_KEYS,
} from './index';

export type StoredDayPlan = StoredEntity & {
  userId: string;
  date: string; // YYYY-MM-DD
  status: 'planned' | 'in_progress' | 'completed';
  xpEarned: number;
  mentorMorningMessage: string | null;
  mentorNightMessage: string | null;
};

export type StoredDayPlanItem = StoredEntity & {
  dayPlanId: string;
  taskId: string | null;
  routineBlockId: string | null;
  workoutId: string | null;
  title: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'done' | 'skipped';
  type: 'routine' | 'task' | 'workout';
  color: string;
  icon: string;
  order: number;
};

const PLAN_KEY = STORAGE_KEYS.DAY_PLANS;
const ITEM_KEY = STORAGE_KEYS.DAY_PLAN_ITEMS;

// --- Day Plan ---

export function getDayPlan(date: string): StoredDayPlan | null {
  const plans = getCollection<StoredDayPlan>(PLAN_KEY);
  return plans.find((p) => p.date === date) ?? null;
}

export function createDayPlan(
  data: Omit<StoredDayPlan, 'id' | 'createdAt'>
): StoredDayPlan {
  return create<StoredDayPlan>(PLAN_KEY, data);
}

export function updateDayPlan(
  id: string,
  data: Partial<StoredDayPlan>
): StoredDayPlan | null {
  return update<StoredDayPlan>(PLAN_KEY, id, data);
}

// --- Day Plan Items ---

export function getDayPlanItems(dayPlanId: string): StoredDayPlanItem[] {
  return getCollection<StoredDayPlanItem>(ITEM_KEY)
    .filter((item) => item.dayPlanId === dayPlanId)
    .sort((a, b) => a.order - b.order);
}

export function createDayPlanItem(
  data: Omit<StoredDayPlanItem, 'id' | 'createdAt'>
): StoredDayPlanItem {
  return create<StoredDayPlanItem>(ITEM_KEY, data);
}

export function updateDayPlanItem(
  id: string,
  data: Partial<StoredDayPlanItem>
): StoredDayPlanItem | null {
  return update<StoredDayPlanItem>(ITEM_KEY, id, data);
}

export function getItemsForDate(date: string): StoredDayPlanItem[] {
  const plan = getDayPlan(date);
  if (!plan) return [];
  return getDayPlanItems(plan.id);
}

export function markItemDone(id: string): StoredDayPlanItem | null {
  return update<StoredDayPlanItem>(ITEM_KEY, id, {
    status: 'done' as const,
  });
}

export function markItemSkipped(id: string): StoredDayPlanItem | null {
  return update<StoredDayPlanItem>(ITEM_KEY, id, {
    status: 'skipped' as const,
  });
}

export function getCompletionForDate(date: string): {
  done: number;
  total: number;
  percentage: number;
} {
  const items = getItemsForDate(date);
  const total = items.length;
  const done = items.filter((i) => i.status === 'done').length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percentage };
}

export function getWeeklyCompletion(): {
  date: string;
  done: number;
  total: number;
  percentage: number;
}[] {
  const results: {
    date: string;
    done: number;
    total: number;
    percentage: number;
  }[] = [];

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    results.push({ date: dateStr, ...getCompletionForDate(dateStr) });
  }

  return results;
}
