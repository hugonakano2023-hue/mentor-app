'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONFETTI_COLORS = [
  'oklch(0.65 0.25 264)', // primary
  'oklch(0.55 0.2 300)',  // accent
  'oklch(0.75 0.2 145)',  // xp green
  'oklch(0.75 0.2 55)',   // streak orange
  'oklch(0.7 0.2 340)',   // pink
  'oklch(0.8 0.15 80)',   // yellow
];

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'strip';
};

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 40,
    vx: (Math.random() - 0.5) * 120,
    vy: -(Math.random() * 60 + 40),
    rotation: Math.random() * 720 - 360,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 8 + 4,
    shape: (['square', 'circle', 'strip'] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function Confetti({ show, onComplete }: { show: boolean; onComplete: () => void }) {
  const [particles] = React.useState(() => generateParticles(40));

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {particles.map((p, idx) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.shape === 'strip' ? p.size * 0.4 : p.size,
                height: p.shape === 'strip' ? p.size * 1.8 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'strip' ? '2px' : '1px',
              }}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              animate={{
                opacity: [1, 1, 0.8, 0],
                x: p.vx,
                y: [0, p.vy, p.vy + 200],
                rotate: p.rotation,
                scale: [1, 1.2, 0.6],
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
                times: [0, 0.3, 0.7, 1],
              }}
              onAnimationComplete={idx === 0 ? onComplete : undefined}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
