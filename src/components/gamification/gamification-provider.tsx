'use client';

import * as React from 'react';
import { GamificationContext } from '@/lib/gamification-context';
import type { Achievement } from '@/lib/storage/achievement-storage';
import { XPToast } from './xp-toast';
import { Confetti } from './confetti';
import { LevelUpModal } from './level-up-modal';
import { AchievementToast } from './achievement-toast';

type XPToastEntry = {
  id: number;
  amount: number;
  reason: string;
};

let toastIdCounter = 0;

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [xpToasts, setXpToasts] = React.useState<XPToastEntry[]>([]);
  const [showConfettiState, setShowConfettiState] = React.useState(false);
  const [levelUp, setLevelUp] = React.useState<{ show: boolean; oldLevel: number; newLevel: number }>({
    show: false,
    oldLevel: 1,
    newLevel: 1,
  });
  const [achievementQueue, setAchievementQueue] = React.useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = React.useState<Achievement | null>(null);

  // Process achievement queue
  React.useEffect(() => {
    if (currentAchievement === null && achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      setCurrentAchievement(next);
      setAchievementQueue(rest);
    }
  }, [achievementQueue, currentAchievement]);

  const showXPToast = React.useCallback((amount: number, reason: string) => {
    const id = ++toastIdCounter;
    setXpToasts((prev) => [...prev, { id, amount, reason }]);
  }, []);

  const showConfetti = React.useCallback(() => {
    setShowConfettiState(true);
  }, []);

  const showLevelUp = React.useCallback((oldLevel: number, newLevel: number) => {
    setLevelUp({ show: true, oldLevel, newLevel });
  }, []);

  const showAchievement = React.useCallback((achievement: Achievement) => {
    setAchievementQueue((prev) => [...prev, achievement]);
  }, []);

  const removeXPToast = React.useCallback((id: number) => {
    setXpToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = React.useMemo(
    () => ({ showXPToast, showConfetti, showLevelUp, showAchievement }),
    [showXPToast, showConfetti, showLevelUp, showAchievement]
  );

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}

      {/* XP Toast stack */}
      {xpToasts.map((toast, idx) => (
        <XPToast
          key={toast.id}
          amount={toast.amount}
          reason={toast.reason}
          offsetIndex={idx}
          onComplete={() => removeXPToast(toast.id)}
        />
      ))}

      {/* Confetti */}
      <Confetti
        show={showConfettiState}
        onComplete={() => setShowConfettiState(false)}
      />

      {/* Level Up Modal */}
      <LevelUpModal
        show={levelUp.show}
        oldLevel={levelUp.oldLevel}
        newLevel={levelUp.newLevel}
        onClose={() => setLevelUp((prev) => ({ ...prev, show: false }))}
      />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={currentAchievement}
        onComplete={() => setCurrentAchievement(null)}
      />
    </GamificationContext.Provider>
  );
}
