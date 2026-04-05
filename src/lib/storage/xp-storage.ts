/**
 * XP & Gamification Storage
 */
import { getValue, setValue, STORAGE_KEYS } from './index';

export type XPState = {
  totalXP: number;
  level: number;
  currentStreak: number; // consecutive days >=80% completion
  longestStreak: number;
  lastActiveDate: string | null;
  xpHistory: { date: string; amount: number; reason: string }[];
};

const KEY = STORAGE_KEYS.XP_STATE;

const DEFAULT_XP_STATE: XPState = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  xpHistory: [],
};

function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 1000) + 1;
}

export function getXPState(): XPState {
  return getValue<XPState>(KEY) ?? { ...DEFAULT_XP_STATE };
}

export function initXPState(): XPState {
  const existing = getValue<XPState>(KEY);
  if (existing) return existing;
  setValue<XPState>(KEY, { ...DEFAULT_XP_STATE });
  return { ...DEFAULT_XP_STATE };
}

export function addXP(amount: number, reason: string): XPState {
  const state = getXPState();
  const today = new Date().toISOString().split('T')[0];

  state.totalXP += amount;
  state.level = calculateLevel(state.totalXP);
  state.xpHistory.push({ date: today, amount, reason });

  setValue<XPState>(KEY, state);
  return state;
}

export function getLevel(): {
  level: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
} {
  const state = getXPState();
  const xpInCurrentLevel = state.totalXP % 1000;
  const xpToNextLevel = 1000 - xpInCurrentLevel;

  return {
    level: state.level,
    totalXP: state.totalXP,
    xpInCurrentLevel,
    xpToNextLevel,
  };
}

export function updateStreak(date: string, completionPct: number): XPState {
  const state = getXPState();

  if (completionPct >= 80) {
    // Check if this is consecutive
    if (state.lastActiveDate) {
      const lastDate = new Date(state.lastActiveDate);
      const currentDate = new Date(date);
      const diffDays = Math.round(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        state.currentStreak++;
      } else if (diffDays > 1) {
        state.currentStreak = 1;
      }
      // diffDays === 0 means same day, don't change streak
    } else {
      state.currentStreak = 1;
    }

    if (state.currentStreak > state.longestStreak) {
      state.longestStreak = state.currentStreak;
    }
  } else {
    state.currentStreak = 0;
  }

  state.lastActiveDate = date;
  setValue<XPState>(KEY, state);
  return state;
}

export function getTodayXP(): number {
  const state = getXPState();
  const today = new Date().toISOString().split('T')[0];
  return state.xpHistory
    .filter((h) => h.date === today)
    .reduce((sum, h) => sum + h.amount, 0);
}

export function getWeekXP(): number {
  const state = getXPState();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return state.xpHistory
    .filter((h) => h.date >= cutoffStr)
    .reduce((sum, h) => sum + h.amount, 0);
}

export function getXPHistory(
  days: number
): { date: string; amount: number; reason: string }[] {
  const state = getXPState();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  return state.xpHistory
    .filter((h) => h.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}
