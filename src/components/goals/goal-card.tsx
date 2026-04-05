'use client';

import * as React from 'react';
import { ChevronDown, Calendar, Clock } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MilestoneItem,
  type MilestoneData,
} from '@/components/goals/milestone-item';
import { cn } from '@/lib/utils';

export type GoalArea =
  | 'negocios'
  | 'carreira'
  | 'financeiro'
  | 'saude'
  | 'pessoal';

export interface GoalData {
  id: string;
  title: string;
  area: GoalArea;
  deadline: string;
  description: string;
  milestones: MilestoneData[];
}

const AREA_CONFIG: Record<
  GoalArea,
  { label: string; icon: string; color: string; twBg: string; twText: string; twBorder: string }
> = {
  negocios: {
    label: 'Negócios',
    icon: '\u{1F3E2}',
    color: 'emerald',
    twBg: 'bg-emerald-500/10',
    twText: 'text-emerald-400',
    twBorder: 'border-emerald-500/30',
  },
  carreira: {
    label: 'Carreira',
    icon: '\u{1F4BC}',
    color: 'blue',
    twBg: 'bg-blue-500/10',
    twText: 'text-blue-400',
    twBorder: 'border-blue-500/30',
  },
  financeiro: {
    label: 'Financeiro',
    icon: '\u{1F4B0}',
    color: 'amber',
    twBg: 'bg-amber-500/10',
    twText: 'text-amber-400',
    twBorder: 'border-amber-500/30',
  },
  saude: {
    label: 'Saúde',
    icon: '\u{1F4AA}',
    color: 'red',
    twBg: 'bg-red-500/10',
    twText: 'text-red-400',
    twBorder: 'border-red-500/30',
  },
  pessoal: {
    label: 'Pessoal',
    icon: '\u{1F9D1}',
    color: 'purple',
    twBg: 'bg-purple-500/10',
    twText: 'text-purple-400',
    twBorder: 'border-purple-500/30',
  },
};

function getOverallProgress(milestones: MilestoneData[]): number {
  if (milestones.length === 0) return 0;
  const total = milestones.reduce((acc, m) => acc + m.progress, 0);
  return Math.round(total / milestones.length);
}

function timeRemaining(dateStr: string): string {
  const deadline = new Date(dateStr + 'T23:59:59');
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff < 0) return 'Prazo vencido';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days > 365) {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return `${years}a ${months}m restantes`;
  }
  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} meses restantes`;
  }
  return `${days} dias restantes`;
}

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function findActiveMilestone(milestones: MilestoneData[]): string | null {
  const now = new Date();
  const active = milestones
    .filter((m) => m.progress < 100)
    .sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  return active.length > 0 ? active[0].id : null;
}

export function GoalCard({ goal }: { goal: GoalData }) {
  const [expanded, setExpanded] = React.useState(false);
  const config = AREA_CONFIG[goal.area];
  const overallProgress = getOverallProgress(goal.milestones);
  const activeMilestoneId = findActiveMilestone(goal.milestones);

  const gradientColors: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-400',
    blue: 'from-blue-500 to-blue-400',
    amber: 'from-amber-500 to-amber-400',
    red: 'from-red-500 to-red-400',
    purple: 'from-purple-500 to-purple-400',
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        expanded && 'ring-1 ring-primary/15'
      )}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-1.5',
                  config.twBg,
                  config.twText,
                  config.twBorder
                )}
              >
                <span className="mr-0.5">{config.icon}</span>
                {config.label}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              {goal.title}
            </CardTitle>
            <CardDescription>{goal.description}</CardDescription>
          </div>
          <div className="text-right shrink-0">
            <span
              className={cn(
                'font-mono text-2xl font-bold tabular-nums',
                overallProgress >= 70
                  ? 'text-emerald-400'
                  : overallProgress >= 40
                    ? 'text-amber-400'
                    : 'text-muted-foreground'
              )}
            >
              {overallProgress}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                gradientColors[config.color] || 'from-primary to-accent'
              )}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span>{formatDeadline(goal.deadline)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>{timeRemaining(goal.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Milestones toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-xs font-medium">
            {goal.milestones.length} milestones
          </span>
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </Button>

        {/* Milestones list */}
        {expanded && (
          <div className="pt-1">
            {goal.milestones.map((milestone, i) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                areaColor={config.color}
                isLast={i === goal.milestones.length - 1}
                isActive={milestone.id === activeMilestoneId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
