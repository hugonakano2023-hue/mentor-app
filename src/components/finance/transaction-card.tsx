'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type TransactionData = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'receita' | 'despesa';
  amount: number;
};

type TransactionCardProps = {
  transaction: TransactionData;
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isReceita = transaction.type === 'receita';

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2.5 backdrop-blur-sm transition-colors hover:bg-card/80">
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          isReceita ? 'bg-emerald-500/10' : 'bg-destructive/10'
        )}
      >
        {isReceita ? (
          <ArrowUpRight className="size-4 text-emerald-500" />
        ) : (
          <ArrowDownRight className="size-4 text-destructive" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{transaction.date}</span>
          <Badge variant="secondary" className="text-[10px] h-4">
            {transaction.category}
          </Badge>
        </div>
      </div>

      <span
        className={cn(
          'text-sm font-bold font-mono tabular-nums shrink-0',
          isReceita ? 'text-emerald-500' : 'text-destructive'
        )}
      >
        {isReceita ? '+' : '-'} R${' '}
        {transaction.amount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}
