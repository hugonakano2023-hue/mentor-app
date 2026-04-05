'use client';

import { cn } from '@/lib/utils';

export type CategoryData = {
  name: string;
  amount: number;
  percentage: number;
  color: string;
};

type CategoryChartProps = {
  categories: CategoryData[];
  className?: string;
};

export function CategoryChart({ categories, className }: CategoryChartProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {categories.map((cat) => (
        <div key={cat.name} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{cat.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono tabular-nums font-semibold">
                R$ {cat.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] font-mono tabular-nums text-muted-foreground w-8 text-right">
                {cat.percentage}%
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
