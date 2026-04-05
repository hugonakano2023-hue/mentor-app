'use client';

import * as React from 'react';
import { ListTodo, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MilestoneData {
  id: string;
  title: string;
  deadline: string;
  progress: number;
  tasksCount: number;
}

interface MilestoneItemProps {
  milestone: MilestoneData;
  areaColor: string;
  isLast: boolean;
  isActive: boolean;
}

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isOverdue(dateStr: string): boolean {
  const deadline = new Date(dateStr + 'T23:59:59');
  return deadline < new Date();
}

function timeRemaining(dateStr: string): string {
  const deadline = new Date(dateStr + 'T23:59:59');
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff < 0) {
    const days = Math.abs(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return `${days}d atrasado`;
  }
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days > 365) {
    const months = Math.floor(days / 30);
    return `${months} meses`;
  }
  if (days > 60) {
    const months = Math.floor(days / 30);
    return `${months} meses`;
  }
  return `${days}d restantes`;
}

export function MilestoneItem({
  milestone,
  areaColor,
  isLast,
  isActive,
}: MilestoneItemProps) {
  const overdue = isOverdue(milestone.deadline) && milestone.progress < 100;

  return (
    <div className="relative flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'size-3 rounded-full border-2 shrink-0 mt-1.5 transition-all',
            milestone.progress === 100
              ? `border-${areaColor} bg-${areaColor}`
              : isActive
                ? `border-${areaColor} bg-${areaColor} animate-pulse`
                : overdue
                  ? 'border-red-500 bg-red-500/30'
                  : 'border-muted-foreground/30 bg-transparent'
          )}
          style={
            milestone.progress === 100 || isActive
              ? {
                  borderColor: `var(--color-${areaColor}, currentColor)`,
                  backgroundColor:
                    milestone.progress === 100
                      ? `var(--color-${areaColor}, currentColor)`
                      : isActive
                        ? `color-mix(in oklch, var(--color-${areaColor}, currentColor) 30%, transparent)`
                        : undefined,
                }
              : undefined
          }
        />
        {!isLast && (
          <div className="w-px flex-1 bg-border min-h-[20px]" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 rounded-lg border p-3 mb-2 transition-all',
          isActive && 'ring-2 ring-primary/30 border-primary/20',
          overdue && !isActive && 'border-red-500/30 bg-red-500/5'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h4 className="text-sm font-semibold leading-tight">
              {milestone.title}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                <span>{formatDeadline(milestone.deadline)}</span>
              </div>
              {overdue && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  <AlertCircle className="size-3 mr-0.5" />
                  {timeRemaining(milestone.deadline)}
                </Badge>
              )}
              {!overdue && milestone.progress < 100 && (
                <span className="text-[10px] text-muted-foreground/70 font-mono">
                  {timeRemaining(milestone.deadline)}
                </span>
              )}
              {milestone.tasksCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ListTodo className="size-3" />
                  <span>{milestone.tasksCount} tarefas</span>
                </div>
              )}
            </div>
          </div>
          <span className="font-mono text-xs font-bold tabular-nums shrink-0">
            {milestone.progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              overdue && milestone.progress < 100
                ? 'bg-red-500'
                : 'bg-primary'
            )}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
