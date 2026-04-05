/**
 * Task Storage
 */
import {
  type StoredEntity,
  getCollection,
  setCollection,
  create,
  update,
  remove,
  getValue,
  setValue,
  STORAGE_KEYS,
} from './index';

export type StoredTask = StoredEntity & {
  userId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: 'alta' | 'media' | 'baixa';
  category: string;
  deadline: string | null; // ISO date
  goalId: string | null;
  milestoneId: string | null;
  status: 'backlog' | 'planned' | 'in_progress' | 'done' | 'skipped';
  recurrence: string | null; // 'daily' | 'weekly' | 'monthly' | null
  recurrenceDays: number[] | null; // days of week for weekly
  parentTaskId: string | null;
  xpValue: number;
  completedAt: string | null;
};

const KEY = STORAGE_KEYS.TASKS;

export function getTasks(): StoredTask[] {
  return getCollection<StoredTask>(KEY);
}

export function getBacklog(): StoredTask[] {
  return getTasks().filter((t) => t.status === 'backlog');
}

export function getTasksByStatus(
  status: StoredTask['status']
): StoredTask[] {
  return getTasks().filter((t) => t.status === status);
}

export function getTasksForGoal(goalId: string): StoredTask[] {
  return getTasks().filter((t) => t.goalId === goalId);
}

export function getSubtasks(parentId: string): StoredTask[] {
  return getTasks().filter((t) => t.parentTaskId === parentId);
}

export function createTask(
  data: Omit<StoredTask, 'id' | 'createdAt'>
): StoredTask {
  return create<StoredTask>(KEY, data);
}

export function updateTask(
  id: string,
  data: Partial<StoredTask>
): StoredTask | null {
  return update<StoredTask>(KEY, id, data);
}

export function deleteTask(id: string): boolean {
  return remove<StoredTask>(KEY, id);
}

export function completeTask(id: string): StoredTask | null {
  return update<StoredTask>(KEY, id, {
    status: 'done' as const,
    completedAt: new Date().toISOString(),
  });
}

export function getCategories(): string[] {
  return getValue<string[]>(STORAGE_KEYS.CATEGORIES) ?? [];
}

export function addCategory(name: string): string[] {
  const categories = getCategories();
  if (!categories.includes(name)) {
    categories.push(name);
    setValue<string[]>(STORAGE_KEYS.CATEGORIES, categories);
  }
  return categories;
}
