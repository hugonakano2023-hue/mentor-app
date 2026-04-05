'use client';

import * as React from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WorkoutTimerProps = {
  seconds: number;
  onComplete?: () => void;
  className?: string;
};

export function WorkoutTimer({ seconds, onComplete, className }: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(seconds);
  const [isRunning, setIsRunning] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    setTimeLeft(seconds);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [seconds]);

  React.useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = seconds > 0 ? ((seconds - timeLeft) / seconds) * 100 : 0;
  const isFinished = timeLeft === 0;

  function handleToggle() {
    if (isFinished) return;
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setTimeLeft(seconds);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur-sm',
        isRunning && 'border-primary/40 glow-card',
        isFinished && 'border-xp/40',
        className
      )}
    >
      <div className="relative flex size-12 shrink-0 items-center justify-center">
        {/* Circular progress */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/30"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-1000',
              isFinished ? 'text-xp' : 'text-primary'
            )}
          />
        </svg>
        <Timer
          className={cn(
            'size-5',
            isRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {isFinished ? 'Descanso completo!' : isRunning ? 'Descansando...' : 'Descanso'}
        </p>
        <p className="text-2xl font-bold font-mono tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleToggle}
          disabled={isFinished}
        >
          {isRunning ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={handleReset}>
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
