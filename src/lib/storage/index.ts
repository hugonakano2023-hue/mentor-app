/**
 * localStorage Storage Layer
 *
 * Generic CRUD helpers with type safety.
 * Mirrors the Drizzle schema types for easy migration to real DB later.
 */

import { v4 as uuidv4 } from 'uuid';

// All stored entities use string IDs and ISO date strings
export type StoredEntity = {
  id: string;
  createdAt: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getCollection<T extends StoredEntity>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCollection<T extends StoredEntity>(key: string, data: T[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getById<T extends StoredEntity>(key: string, id: string): T | null {
  const collection = getCollection<T>(key);
  return collection.find(item => item.id === id) ?? null;
}

export function create<T extends StoredEntity>(key: string, data: Omit<T, 'id' | 'createdAt'>): T {
  const collection = getCollection<T>(key);
  const newItem = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  } as T;
  collection.push(newItem);
  setCollection(key, collection);
  return newItem;
}

export function update<T extends StoredEntity>(key: string, id: string, data: Partial<T>): T | null {
  const collection = getCollection<T>(key);
  const index = collection.findIndex(item => item.id === id);
  if (index === -1) return null;
  collection[index] = { ...collection[index], ...data, id }; // preserve id
  setCollection(key, collection);
  return collection[index];
}

export function remove<T extends StoredEntity>(key: string, id: string): boolean {
  const collection = getCollection<T>(key);
  const filtered = collection.filter(item => item.id !== id);
  if (filtered.length === collection.length) return false;
  setCollection(key, filtered);
  return true;
}

// Singleton value (for user profile, XP state, etc.)
export function getValue<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setValue<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Storage keys
export const STORAGE_KEYS = {
  USER: 'mentor_user',
  ROUTINE_BLOCKS: 'mentor_routine_blocks',
  TASKS: 'mentor_tasks',
  DAY_PLANS: 'mentor_day_plans',
  DAY_PLAN_ITEMS: 'mentor_day_plan_items',
  WORKOUTS: 'mentor_workouts',
  TRANSACTIONS: 'mentor_transactions',
  DEBTS: 'mentor_debts',
  HABITS: 'mentor_habits',
  HABIT_LOGS: 'mentor_habit_logs',
  GOALS: 'mentor_goals',
  MILESTONES: 'mentor_milestones',
  CHAT_MESSAGES: 'mentor_chat_messages',
  WEEKLY_REVIEWS: 'mentor_weekly_reviews',
  XP_STATE: 'mentor_xp_state',
  ONBOARDING_DONE: 'mentor_onboarding_done',
  CATEGORIES: 'mentor_categories',
  ACHIEVEMENTS: 'mentor_achievements',
  DAILY_QUESTS: 'mentor_daily_quests',
} as const;
