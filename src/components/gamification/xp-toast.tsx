'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

type XPToastProps = {
  amount: number;
  reason: string;
  onComplete: () => void;
  offsetIndex?: number;
};

export function XPToast({ amount, reason, onComplete, offsetIndex = 0 }: XPToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="pointer-events-none fixed right-6 z-50 flex items-center gap-2"
        style={{ bottom: 80 + offsetIndex * 48 }}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: -80 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
      >
        <div className="flex items-center gap-1.5 rounded-lg bg-xp/15 px-3 py-2 backdrop-blur-md border border-xp/20"
          style={{ boxShadow: '0 0 20px oklch(0.75 0.2 145 / 0.4), 0 0 40px oklch(0.75 0.2 145 / 0.15)' }}
        >
          <Zap className="size-4 text-xp fill-xp" />
          <span className="font-mono text-sm font-bold text-xp">
            +{amount} XP
          </span>
        </div>
        {reason && (
          <span className="text-xs font-medium text-muted-foreground/80 whitespace-nowrap">
            {reason}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
