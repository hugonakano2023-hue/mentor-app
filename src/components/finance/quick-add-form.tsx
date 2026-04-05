'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'Moradia',
  'Alimentacao',
  'Transporte',
  'Lazer',
  'Maconha',
  'Assinaturas',
  'Salario',
  'Freelance',
  'Outros',
];

type QuickAddFormProps = {
  onAdd: (data: { amount: number; category: string; type: 'receita' | 'despesa' }) => void;
  className?: string;
};

export function QuickAddForm({ onAdd, className }: QuickAddFormProps) {
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState<string>('');
  const [type, setType] = React.useState<'receita' | 'despesa'>('despesa');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || !category) return;
    onAdd({ amount: numAmount, category, type });
    setAmount('');
    setCategory('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-wrap items-end gap-2 rounded-xl border border-border/50 bg-card/60 p-3 backdrop-blur-sm',
        className
      )}
    >
      {/* Type toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setType('despesa')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            type === 'despesa'
              ? 'bg-destructive/20 text-destructive'
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setType('receita')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            type === 'receita'
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          Receita
        </button>
      </div>

      {/* Amount */}
      <div className="flex-1 min-w-[120px]">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
          Valor
        </label>
        <Input
          type="number"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="font-mono"
          min={0}
          step={0.01}
        />
      </div>

      {/* Category */}
      <div className="min-w-[140px]">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
          Categoria
        </label>
        <Select value={category} onValueChange={(val) => setCategory(val ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={!amount || !category}>
        <Plus className="size-4 mr-1" />
        Salvar
      </Button>
    </form>
  );
}
