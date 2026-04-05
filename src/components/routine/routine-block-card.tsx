'use client';

import * as React from 'react';
import { Clock, ListChecks, Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export type RoutineSubItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type RoutineBlockData = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  color: string;
  icon: string;
  subItems: RoutineSubItem[];
};

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

interface RoutineBlockCardProps {
  block: RoutineBlockData;
  onEdit?: (block: RoutineBlockData) => void;
  onSubItemCheck?: (blockId: string, subItemId: string, checked: boolean) => void;
}

export function RoutineBlockCard({ block, onEdit, onSubItemCheck }: RoutineBlockCardProps) {
  const checkedCount = block.subItems.filter((s) => s.checked).length;
  const totalCount = block.subItems.length;

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/30 hover:glow-card'
      )}
      onClick={() => onEdit?.(block)}
    >
      {/* Colored left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: block.color }}
      />

      <CardContent className="pl-5">
        <div className="flex items-start justify-between gap-3">
          {/* Icon + Info */}
          <div className="flex items-start gap-3 min-w-0">
            <span
              className="flex size-10 items-center justify-center rounded-lg text-lg shrink-0"
              style={{ backgroundColor: `${block.color}20` }}
            >
              {block.icon}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{block.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span className="tabular-nums">
                  {block.startTime} - {block.endTime}
                </span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(block);
            }}
          >
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Days of week badges */}
        <div className="flex flex-wrap gap-1 mt-3">
          {DAY_LABELS.map((label, index) => {
            const isActive = block.daysOfWeek.includes(index);
            return (
              <span
                key={index}
                className={cn(
                  'inline-flex h-5 items-center justify-center rounded-md px-1.5 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-white'
                    : 'bg-secondary text-muted-foreground/50'
                )}
                style={isActive ? { backgroundColor: block.color } : undefined}
              >
                {label}
              </span>
            );
          })}
        </div>

        {/* Sub-items with checkboxes */}
        {block.subItems.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListChecks className="size-3" />
              <span>
                {checkedCount}/{totalCount} sub-itens
              </span>
            </div>
            <div className="space-y-1">
              {block.subItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(val) => {
                      onSubItemCheck?.(block.id, item.id, val === true);
                    }}
                    className="shrink-0"
                  />
                  <span
                    className={cn(
                      'text-xs transition-all',
                      item.checked && 'line-through text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
