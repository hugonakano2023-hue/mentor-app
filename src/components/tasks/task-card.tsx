'use client';

import * as React from 'react';
import {
  Clock,
  CalendarClock,
  Target,
  ListChecks,
  Pencil,
  CheckCircle2,
  Circle,
  Play,
  Inbox,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type TaskPriority = 'alta' | 'media' | 'baixa';
export type TaskStatus = 'backlog' | 'planned' | 'in_progress' | 'done' | 'skipped';

export type TaskData = {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  estimatedMinutes: number;
  status: TaskStatus;
  goalId?: string | null;
  deadline?: string | null;
  subtaskCount?: number;
  recurrence?: string | null;
  parentTaskId?: string | null;
};

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string }> = {
  alta: { color: 'bg-red-500', label: 'Alta' },
  media: { color: 'bg-yellow-500', label: 'Media' },
  baixa: { color: 'bg-slate-400', label: 'Baixa' },
};

const CATEGORY_COLORS: Record<string, string> = {
  '4LeafTech': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  LuckBet: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Pessoal: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Financeiro: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Saude: 'bg-red-500/15 text-red-400 border-red-500/30',
  Estudo: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Casa: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Desenvolvimento: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Negocios: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
};

const STATUS_CONFIG: Record<
  TaskStatus,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  backlog: { icon: Inbox, label: 'Backlog' },
  planned: { icon: Circle, label: 'Planejada' },
  in_progress: { icon: Play, label: 'Em andamento' },
  done: { icon: CheckCircle2, label: 'Concluida' },
  skipped: { icon: Circle, label: 'Pulada' },
};

const RECURRENCE_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

interface TaskCardProps {
  task: TaskData;
  onEdit?: (task: TaskData) => void;
  onComplete?: (id: string) => void;
}

export function TaskCard({ task, onEdit, onComplete }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const categoryClass =
    CATEGORY_COLORS[task.category] ??
    'bg-secondary text-muted-foreground border-border';
  const StatusIcon = STATUS_CONFIG[task.status].icon;
  const isDone = task.status === 'done';

  function formatMinutes(min: number): string {
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  }

  function formatDeadline(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return 'Atrasada';
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanha';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:ring-2 hover:ring-primary/20 cursor-pointer',
        isDone && 'opacity-60'
      )}
      onClick={() => onEdit?.(task)}
    >
      <CardContent>
        <div className="flex items-start gap-3">
          {/* Priority dot + status icon */}
          <div className="flex flex-col items-center gap-1.5 pt-0.5">
            <span
              className={cn('size-2.5 rounded-full shrink-0', priority.color)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isDone && onComplete) onComplete(task.id);
              }}
            >
              <StatusIcon
                className={cn(
                  'size-4',
                  isDone ? 'text-emerald-400' : 'text-muted-foreground hover:text-primary transition-colors'
                )}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  'font-medium text-sm leading-tight',
                  isDone && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(task);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn('text-[10px] h-4 px-1.5 border', categoryClass)}
              >
                {task.category}
              </Badge>

              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {formatMinutes(task.estimatedMinutes)}
              </span>

              {task.deadline && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    formatDeadline(task.deadline) === 'Atrasada'
                      ? 'text-red-400'
                      : 'text-muted-foreground'
                  )}
                >
                  <CalendarClock className="size-3" />
                  {formatDeadline(task.deadline)}
                </span>
              )}

              {task.goalId && (
                <span className="flex items-center gap-1 text-xs text-primary/80">
                  <Target className="size-3" />
                  Meta
                </span>
              )}

              {task.subtaskCount != null && task.subtaskCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ListChecks className="size-3" />
                  {task.subtaskCount}
                </span>
              )}

              {task.recurrence && (
                <span className="flex items-center gap-1 text-xs text-accent">
                  <Repeat className="size-3" />
                  {RECURRENCE_LABELS[task.recurrence] ?? task.recurrence}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
