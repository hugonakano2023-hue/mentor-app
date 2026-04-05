'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { Achievement } from '@/lib/storage/achievement-storage';

type AchievementToastProps = {
  achievement: Achievement | null;
  onComplete: () => void;
};

export function AchievementToast({ achievement, onComplete }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <motion.div
            className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-card/95 px-5 py-4 shadow-2xl backdrop-blur-md"
            style={{ boxShadow: '0 0 30px oklch(0.8 0.15 80 / 0.4), 0 0 60px oklch(0.8 0.15 80 / 0.15)' }}
            animate={{
              boxShadow: [
                '0 0 30px oklch(0.8 0.15 80 / 0.4), 0 0 60px oklch(0.8 0.15 80 / 0.15)',
                '0 0 40px oklch(0.8 0.15 80 / 0.6), 0 0 80px oklch(0.8 0.15 80 / 0.25)',
                '0 0 30px oklch(0.8 0.15 80 / 0.4), 0 0 60px oklch(0.8 0.15 80 / 0.15)',
              ],
            }}
            transition={{ duration: 2, repeat: 1 }}
            onAnimationComplete={onComplete}
          >
            {/* Icon */}
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/15 text-2xl">
              {achievement.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Trophy className="size-3" />
                Achievement Unlocked!
              </div>
              <p className="mt-0.5 text-sm font-semibold">{achievement.name}</p>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
