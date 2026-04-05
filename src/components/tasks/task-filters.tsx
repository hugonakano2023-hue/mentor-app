'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TaskFilterValue = 'todas' | 'backlog' | 'hoje' | 'concluidas';

interface TaskFiltersProps {
  value: TaskFilterValue;
  onChange: (value: TaskFilterValue) => void;
  counts: Record<TaskFilterValue, number>;
}

export function TaskFilters({ value, onChange, counts }: TaskFiltersProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(val) => onChange(val as TaskFilterValue)}
    >
      <TabsList>
        <TabsTrigger value="todas">
          Todas
          <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
            {counts.todas}
          </span>
        </TabsTrigger>
        <TabsTrigger value="backlog">
          Backlog
          <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
            {counts.backlog}
          </span>
        </TabsTrigger>
        <TabsTrigger value="hoje">
          Hoje
          <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
            {counts.hoje}
          </span>
        </TabsTrigger>
        <TabsTrigger value="concluidas">
          Concluídas
          <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">
            {counts.concluidas}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
