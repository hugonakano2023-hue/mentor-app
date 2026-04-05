'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTransaction } from '@/lib/storage/finance-storage';
import { useGamification } from '@/lib/gamification-context';
import { addXP } from '@/lib/storage/xp-storage';
import { cn } from '@/lib/utils';
import { eventBus } from '@/lib/event-bus';

const EXPENSE_CATEGORIES = [
  { label: 'Alimentacao', emoji: '\uD83C\uDF54' },
  { label: 'Transporte', emoji: '\uD83D\uDE97' },
  { label: 'Lazer', emoji: '\uD83C\uDFAE' },
  { label: 'Maconha', emoji: '\uD83C\uDF43' },
  { label: 'Moradia', emoji: '\uD83C\uDFE0' },
  { label: 'Assinaturas', emoji: '\uD83D\uDCF1' },
  { label: 'Outros', emoji: '\uD83D\uDCE6' },
];

export function QuickExpenseFAB() {
  const [expanded, setExpanded] = React.useState(false);
  const [step, setStep] = React.useState<'amount' | 'category' | 'done'>('amount');
  const [amount, setAmount] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { showXPToast } = useGamification();

  function reset() {
    setExpanded(false);
    setStep('amount');
    setAmount('');
    setSaved(false);
  }

  function handleAmountSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    setStep('category');
  }

  function handleCategorySelect(category: string) {
    const num = parseFloat(amount);
    if (!num) return;

    const today = new Date().toISOString().split('T')[0];
    createTransaction({
      userId: 'local',
      amount: num,
      type: 'despesa',
      category,
      description: `Gasto rápido: ${category}`,
      date: today,
      recurring: false,
    });

    // Award XP for financial tracking
    const xpAmount = 5;
    addXP(xpAmount, 'Registro de gasto');
    showXPToast(xpAmount, 'Gasto registrado');

    eventBus.emit('xp:earned', {
      amount: xpAmount,
      reason: 'Registro de gasto',
      newTotal: 0,
    });

    setSaved(true);
    setStep('done');

    // Auto-close after success feedback
    setTimeout(reset, 1200);
  }

  // Focus input when expanded
  React.useEffect(() => {
    if (expanded && step === 'amount') {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [expanded, step]);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <AnimatePresence mode="wait">
        {!expanded ? (
          /* Collapsed FAB */
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(true)}
            className="flex items-center justify-center size-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-colors"
          >
            <span className="text-lg font-bold">R$</span>
          </motion.button>
        ) : (
          /* Expanded card */
          <motion.div
            key="card"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-72 rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-600">
              <span className="text-sm font-semibold text-white">Gasto Rápido</span>
              <button
                onClick={reset}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                {/* Step 1: Amount */}
                {step === 'amount' && (
                  <motion.form
                    key="amount"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleAmountSubmit}
                    className="space-y-3"
                  >
                    <label className="text-xs text-muted-foreground font-medium">
                      Quanto gastou?
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono text-sm">R$</span>
                      <Input
                        ref={inputRef}
                        type="number"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="font-mono text-lg"
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!amount || parseFloat(amount) <= 0}
                      className="w-full bg-emerald-600 hover:bg-emerald-500"
                    >
                      Continuar
                    </Button>
                  </motion.form>
                )}

                {/* Step 2: Category */}
                {step === 'category' && (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground font-medium">
                        Categoria
                      </label>
                      <span className="text-xs font-mono text-emerald-500 font-bold">
                        R$ {parseFloat(amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => handleCategorySelect(cat.label)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left',
                            'border border-border hover:bg-secondary/80 hover:border-emerald-500/30',
                            'transition-all duration-150'
                          )}
                        >
                          <span>{cat.emoji}</span>
                          <span className="text-xs font-medium truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Done */}
                {step === 'done' && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-4 gap-2"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 300 }}
                      className="flex items-center justify-center size-12 rounded-full bg-emerald-500/20"
                    >
                      <Check className="size-6 text-emerald-500" />
                    </motion.div>
                    <p className="text-sm font-medium text-emerald-500">Salvo!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
