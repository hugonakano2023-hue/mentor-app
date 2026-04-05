'use client';

import { createContext, useContext } from 'react';
import type { Achievement } from '@/lib/storage/achievement-storage';

export type GamificationContextType = {
  showXPToast: (amount: number, reason: string) => void;
  showConfetti: () => void;
  showLevelUp: (oldLevel: number, newLevel: number) => void;
  showAchievement: (achievement: Achievement) => void;
};

export const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamification(): GamificationContextType {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return ctx;
}
