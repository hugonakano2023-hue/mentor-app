'use client';

import { AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type DebtData = {
  id: string;
  creditor: string;
  total: number;
  paid: number;
  interestRate: string;
  deadline: string;
};

type DebtCardProps = {
  debt: DebtData;
};

export function DebtCard({ debt }: DebtCardProps) {
  const remaining = debt.total - debt.paid;
  const progress = Math.round((debt.paid / debt.total) * 100);
  const isUrgent = progress < 30;

  return (
    <Card
      className={cn(
        'border-0 bg-card/80 backdrop-blur-sm transition-all duration-300 glow-card',
        isUrgent && 'ring-1 ring-destructive/30'
      )}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            {isUrgent && <AlertTriangle className="size-4 text-destructive" />}
            {debt.creditor}
          </CardTitle>
          <Badge
            variant={isUrgent ? 'destructive' : 'secondary'}
            className="text-[10px]"
          >
            {progress}% pago
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progress >= 60
                  ? 'bg-emerald-500'
                  : progress >= 30
                    ? 'bg-amber-500'
                    : 'bg-destructive'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono tabular-nums text-muted-foreground">
              R$ {debt.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pago
            </span>
            <span className="font-mono tabular-nums font-semibold">
              R$ {debt.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} total
            </span>
          </div>
        </div>

        {/* Remaining + details */}
        <div className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Restante
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-destructive">
              R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="size-3" />
              <span>Juros: {debt.interestRate}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="size-3" />
              <span>{debt.deadline}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
