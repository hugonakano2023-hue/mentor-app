'use client';

import { cn } from '@/lib/utils';

interface LabeledSkeletonProps {
  label: string;
  lines?: number;
  className?: string;
}

export function LabeledSkeleton({ label, lines = 3, className }: LabeledSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-12 rounded-xl animate-shimmer',
            i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
}
