'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ExerciseSet } from '@/types';

type ExerciseCardProps = {
  exercise: ExerciseSet;
  index: number;
  completed: boolean;
  currentWeight: number;
  onToggleComplete: () => void;
  onWeightChange: (weight: number) => void;
  onStartRest: (seconds: number) => void;
};

export function ExerciseCard({
  exercise,
  index,
  completed,
  currentWeight,
  onToggleComplete,
  onWeightChange,
  onStartRest,
}: ExerciseCardProps) {
  const [showInstructions, setShowInstructions] = React.useState(false);

  const restLabel =
    exercise.restSeconds >= 60
      ? `${Math.floor(exercise.restSeconds / 60)}min${exercise.restSeconds % 60 > 0 ? ` ${exercise.restSeconds % 60}s` : ''}`
      : `${exercise.restSeconds}s`;

  return (
    <Card
      className={cn(
        'border-0 bg-card/80 backdrop-blur-sm transition-all duration-300 glow-card',
        completed && 'opacity-60 bg-card/40'
      )}
    >
      <CardContent className="space-y-3">
        {/* Top row: index + name + checkbox */}
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm tabular-nums">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'text-sm font-bold leading-tight',
                  completed && 'line-through text-muted-foreground'
                )}
              >
                {exercise.name}
              </h3>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-[10px]">
                <Dumbbell className="size-2.5 mr-0.5" />
                {exercise.muscleGroup}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                {exercise.sets}x{exercise.reps}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] cursor-pointer hover:bg-primary/10"
                onClick={() => onStartRest(exercise.restSeconds)}
              >
                <Clock className="size-2.5 mr-0.5" />
                {restLabel}
              </Badge>
            </div>
          </div>

          <Checkbox
            checked={completed}
            onCheckedChange={onToggleComplete}
            className="mt-1"
          />
        </div>

        {/* Weight + equipment row */}
        <div className="flex items-center gap-3 pl-11">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Peso:
            </span>
            <Input
              type="number"
              value={currentWeight || ''}
              onChange={(e) => onWeightChange(Number(e.target.value))}
              className="h-7 w-20 text-center font-mono text-sm"
              placeholder="0"
              min={0}
            />
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <span className="text-[10px] text-muted-foreground truncate">
            {exercise.equipment}
          </span>
        </div>

        {/* Instructions toggle */}
        <div className="pl-11">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-muted-foreground gap-1 px-1"
          >
            <Info className="size-3" />
            <span className="text-[10px]">
              {showInstructions ? 'Ocultar' : 'Ver instrucoes'}
            </span>
            {showInstructions ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </Button>

          {showInstructions && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed bg-secondary/50 rounded-lg p-2.5">
              {exercise.instructions}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
