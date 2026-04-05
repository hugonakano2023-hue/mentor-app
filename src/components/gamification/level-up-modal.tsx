'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Confetti } from './confetti';

function getLevelIcon(level: number): string {
  if (level < 5) return '\u{1F331}';   // seedling
  if (level < 10) return '\u{1F33F}';  // herb
  if (level < 20) return '\u{1F333}';  // tree
  if (level < 30) return '\u{1F3D4}\u{FE0F}'; // mountain
  return '\u2B50';                       // star
}

type LevelUpModalProps = {
  show: boolean;
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
};

function CounterAnimation({ from, to }: { from: number; to: number }) {
  const [current, setCurrent] = React.useState(from);

  React.useEffect(() => {
    if (from >= to) {
      setCurrent(to);
      return;
    }
    let frame = from;
    const step = () => {
      frame++;
      setCurrent(frame);
      if (frame < to) {
        requestAnimationFrame(step);
      }
    };
    const timeout = setTimeout(step, 400);
    return () => clearTimeout(timeout);
  }, [from, to]);

  return <>{current}</>;
}

export function LevelUpModal({ show, oldLevel, newLevel, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setShowConfetti(true);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative mx-4 w-full max-w-sm rounded-2xl border border-primary/20 bg-card p-8 text-center shadow-2xl"
              style={{ boxShadow: '0 0 60px oklch(0.65 0.25 264 / 0.3), 0 0 120px oklch(0.65 0.25 264 / 0.1)' }}
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
            >
              {/* LEVEL UP text */}
              <motion.h2
                className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-primary"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                LEVEL UP!
              </motion.h2>

              {/* Level icon */}
              <motion.div
                className="mb-4 text-6xl"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.4 }}
              >
                {getLevelIcon(newLevel)}
              </motion.div>

              {/* Level number */}
              <motion.div
                className="mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="font-mono text-7xl font-black tracking-tighter text-primary"
                  style={{ textShadow: '0 0 40px oklch(0.65 0.25 264 / 0.5)' }}
                >
                  <CounterAnimation from={oldLevel} to={newLevel} />
                </span>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="mb-6 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {newLevel < 5
                  ? 'Voce esta comecando sua jornada!'
                  : newLevel < 10
                    ? 'Voce esta ganhando consistencia!'
                    : newLevel < 20
                      ? 'Voce esta se tornando imparavel!'
                      : 'Voce e uma lenda!'}
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button onClick={onClose} className="w-full">
                  Continuar
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
