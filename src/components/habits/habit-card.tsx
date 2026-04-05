'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface HabitData {
  name: string;
  icon: string;
  streak: number;
  last7: (boolean | null)[];
}

function getTrend(last7: (boolean | null)[]): 'up' | 'down' | 'stable' {
  const completed = last7.filter((d) => d !== null);
  if (completed.length < 4) return 'stable';
  const firstHalf = completed.slice(0, Math.floor(completed.length / 2));
  const secondHalf = completed.slice(Math.floor(completed.length / 2));
  const firstRate =
    firstHalf.filter(Boolean).length / firstHalf.length;
  const secondRate =
    secondHalf.filter(Boolean).length / secondHalf.length;
  if (secondRate > firstRate + 0.1) return 'up';
  if (secondRate < firstRate - 0.1) return 'down';
  return 'stable';
}

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function HabitCard({ habit }: { habit: HabitData }) {
  const trend = getTrend(habit.last7);

  return (
    <Card className="group hover:ring-primary/20 transition-all duration-200">
      <CardContent className="space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" role="img" aria-label={habit.name}>
              {habit.icon}
            </span>
            <span className="text-sm font-semibold leading-tight">
              {habit.name}
            </span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1',
              trend === 'up' && 'bg-emerald-500/10 text-emerald-400',
              trend === 'down' && 'bg-red-500/10 text-red-400',
              trend === 'stable' && 'bg-secondary text-muted-foreground'
            )}
          >
            {trend === 'up' && <TrendingUp className="size-3.5" />}
            {trend === 'down' && <TrendingDown className="size-3.5" />}
            {trend === 'stable' && <Minus className="size-3.5" />}
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {trend === 'up' && 'Subindo'}
              {trend === 'down' && 'Caindo'}
              {trend === 'stable' && 'Estável'}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <Flame
            className={cn(
              'size-4',
              habit.streak > 0 ? 'text-streak' : 'text-muted-foreground/40'
            )}
          />
          <span
            className={cn(
              'font-mono text-sm font-bold tabular-nums',
              habit.streak > 0 ? 'text-streak' : 'text-muted-foreground/60'
            )}
          >
            {habit.streak}
          </span>
          <span className="text-xs text-muted-foreground">
            {habit.streak === 1 ? 'dia' : 'dias'} de streak
          </span>
        </div>

        {/* Last 7 days mini chart */}
        <div className="flex items-end gap-1.5">
          {habit.last7.map((day, i) => {
            const isToday = i === habit.last7.length - 1 && day === null;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full h-6 rounded-sm transition-all duration-300',
                    isToday && 'ring-2 ring-primary/50 ring-offset-1 ring-offset-card',
                    day === true && 'bg-emerald-500/80',
                    day === false && 'bg-red-500/25',
                    day === null && !isToday && 'bg-secondary',
                    day === null && isToday && 'bg-primary/20'
                  )}
                />
                <span
                  className={cn(
                    'text-[9px] font-medium',
                    isToday
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground/60'
                  )}
                >
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Completion rate */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Últimos 7 dias
          </span>
          <Badge variant="secondary" className="text-[10px] font-mono">
            {habit.last7.filter((d) => d === true).length}/
            {habit.last7.filter((d) => d !== null).length} dias
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
