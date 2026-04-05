'use client';

import * as React from 'react';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TransactionCard,
  type TransactionData,
} from '@/components/finance/transaction-card';
import { DebtCard, type DebtData } from '@/components/finance/debt-card';
import {
  CategoryChart,
  type CategoryData,
} from '@/components/finance/category-chart';
import { QuickAddForm } from '@/components/finance/quick-add-form';
import { cn } from '@/lib/utils';
import {
  getTransactionsForMonth,
  createTransaction,
  getMonthSummary,
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt as deleteDebtStorage,
  getDebtSummary,
  type StoredTransaction,
  type StoredDebt,
} from '@/lib/storage/finance-storage';
import { getUser } from '@/lib/storage/user-storage';

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#6366f1',
  Alimentacao: '#22c55e',
  Maconha: '#a855f7',
  Transporte: '#3b82f6',
  Lazer: '#f59e0b',
  Assinaturas: '#ec4899',
  Salario: '#10b981',
  Freelance: '#06b6d4',
  Outros: '#64748b',
};

export default function FinanceiroPage() {
  const [transactions, setTransactions] = React.useState<StoredTransaction[]>(
    []
  );
  const [debts, setDebts] = React.useState<StoredDebt[]>([]);
  const [summary, setSummary] = React.useState({
    receita: 0,
    despesa: 0,
    saldo: 0,
    byCategory: {} as Record<string, number>,
  });
  const [debtSummaryData, setDebtSummaryData] = React.useState({
    total: 0,
    paid: 0,
    remaining: 0,
  });
  const [loaded, setLoaded] = React.useState(false);

  const today = new Date();
  const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = today.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  function loadData() {
    const txs = getTransactionsForMonth(yearMonth);
    setTransactions(
      txs.sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    setSummary(getMonthSummary(yearMonth));
    setDebts(getDebts());
    setDebtSummaryData(getDebtSummary());
  }

  React.useEffect(() => {
    loadData();
    setLoaded(true);
  }, []);

  const { receita, despesa, saldo, byCategory } = summary;

  // Build categories for the chart
  const totalDespesa = despesa || 1;
  const categories: CategoryData[] = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalDespesa) * 100),
      color: CATEGORY_COLORS[name] ?? '#64748b',
    }))
    .sort((a, b) => b.amount - a.amount);

  // Debt totals
  const totalDebt = debtSummaryData.total;
  const totalPaid = debtSummaryData.paid;
  const debtProgress = totalDebt > 0 ? Math.round((totalPaid / totalDebt) * 100) : 0;

  // Budget alert: check if any category exceeds user's fixed costs
  const user = getUser();
  const budgetAlerts: { category: string; exceeded: number }[] = [];
  if (user?.fixedCosts) {
    for (const cost of user.fixedCosts) {
      const spent = byCategory[cost.name] ?? 0;
      if (spent > cost.amount) {
        budgetAlerts.push({
          category: cost.name,
          exceeded: spent - cost.amount,
        });
      }
    }
  }

  // Projection: extrapolate remaining days
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const dailyRate = dayOfMonth > 0 ? despesa / dayOfMonth : 0;
  const projectedDespesa = Math.round(dailyRate * daysInMonth);
  const projectedSaldo = receita - projectedDespesa;

  function handleAddTransaction(data: {
    amount: number;
    category: string;
    type: 'receita' | 'despesa';
  }) {
    const todayStr = new Date().toISOString().split('T')[0];
    createTransaction({
      userId: 'local',
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: `${data.category} — novo`,
      date: todayStr,
      recurring: false,
    });
    loadData();
  }

  function handleDeleteDebt(id: string) {
    deleteDebtStorage(id);
    loadData();
  }

  if (!loaded) return null;

  // Convert StoredTransaction to TransactionData for the card
  function toTransactionData(tx: StoredTransaction): TransactionData {
    return {
      id: tx.id,
      date: new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR'),
      description: tx.description,
      category: tx.category,
      type: tx.type,
      amount: tx.amount,
    };
  }

  // Convert StoredDebt to DebtData for the card
  function toDebtData(d: StoredDebt): DebtData {
    return {
      id: d.id,
      creditor: d.creditor,
      total: d.totalAmount,
      paid: d.paidAmount,
      interestRate: d.interestRate ? `${d.interestRate}%/mes` : 'Sem juros',
      deadline: d.deadline ?? 'Sem prazo',
    };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-xp/15">
            <Wallet className="size-5 text-xp" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-sm text-muted-foreground capitalize">
              CFO Pessoal — {monthLabel}
            </p>
          </div>
        </div>
        <Button className="md:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg">
          <Plus className="size-6" />
        </Button>
        <Button className="hidden md:flex">
          <Plus className="size-4 mr-1.5" />
          Novo Registro
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visao Geral</TabsTrigger>
          <TabsTrigger value="transacoes">Transacoes</TabsTrigger>
          <TabsTrigger value="dividas">Dividas</TabsTrigger>
          <TabsTrigger value="metas">Metas</TabsTrigger>
        </TabsList>

        {/* ── Tab: Visao Geral ───────────────────────────────── */}
        <TabsContent value="visao-geral">
          <div className="space-y-4">
            {/* Saldo do mes */}
            <Card className="border-0 bg-gradient-to-r from-xp/10 via-card/80 to-card/80 glow-card">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Saldo do mes
                    </p>
                    <p
                      className={cn(
                        'text-3xl font-bold font-mono tabular-nums mt-1',
                        saldo >= 0 ? 'text-emerald-500' : 'text-destructive'
                      )}
                    >
                      R${' '}
                      {saldo.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex size-12 items-center justify-center rounded-xl',
                      saldo >= 0 ? 'bg-emerald-500/10' : 'bg-destructive/10'
                    )}
                  >
                    {saldo >= 0 ? (
                      <TrendingUp className="size-6 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-6 text-destructive" />
                    )}
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Receita
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ArrowUpRight className="size-4 text-emerald-500" />
                      <span className="text-lg font-bold font-mono tabular-nums text-emerald-500">
                        R${' '}
                        {receita.toLocaleString('pt-BR', {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Despesa
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ArrowDownRight className="size-4 text-destructive" />
                      <span className="text-lg font-bold font-mono tabular-nums text-destructive">
                        R${' '}
                        {despesa.toLocaleString('pt-BR', {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projecao */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card">
              <CardContent className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Projecao
                  </p>
                  <p className="text-sm">
                    Se continuar nesse ritmo, termina o mes com{' '}
                    <span
                      className={cn(
                        'font-bold font-mono',
                        projectedSaldo >= 0
                          ? 'text-emerald-500'
                          : 'text-destructive'
                      )}
                    >
                      R${' '}
                      {projectedSaldo.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gastos por categoria */}
            {categories.length > 0 && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryChart categories={categories} />
                </CardContent>
              </Card>
            )}

            {/* Budget alerts */}
            {budgetAlerts.map((alert) => (
              <Card
                key={alert.category}
                className="border-0 ring-1 ring-amber-500/30 bg-amber-500/5"
              >
                <CardContent className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                    <AlertTriangle className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-500">
                      Orcamento ultrapassado
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.category} ultrapassou o orcamento em{' '}
                      <span className="font-mono font-bold text-amber-500">
                        R${alert.exceeded.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      . Considere ajustar seus gastos nessa categoria.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Fallback if no data */}
            {receita === 0 && despesa === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-xp/10 mb-4">
                  <Wallet className="size-8 text-xp/60" />
                </div>
                <h3 className="font-semibold">Sem dados financeiros</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Adicione transacoes na aba Transacoes para ver seu resumo
                  financeiro.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Transacoes ────────────────────────────────── */}
        <TabsContent value="transacoes">
          <div className="space-y-4">
            {/* Quick add form */}
            <QuickAddForm onAdd={handleAddTransaction} />

            {/* Transaction list */}
            <div className="space-y-2">
              {transactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={toTransactionData(tx)}
                />
              ))}
            </div>

            {transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-xp/10 mb-4">
                  <Wallet className="size-8 text-xp/60" />
                </div>
                <h3 className="font-semibold">Nenhuma transacao</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Adicione sua primeira transacao para comecar a rastrear suas
                  financas.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Dividas ───────────────────────────────────── */}
        <TabsContent value="dividas">
          <div className="space-y-4">
            {/* Summary card */}
            <Card className="border-0 bg-gradient-to-r from-destructive/10 via-card/80 to-card/80 glow-card">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Total em dividas
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-destructive">
                    R${' '}
                    {debtSummaryData.remaining.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    de R${' '}
                    {totalDebt.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    total
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-destructive/10">
                    <CreditCard className="size-7 text-destructive" />
                  </div>
                  <p className="text-xs font-mono tabular-nums text-muted-foreground mt-1">
                    {debtProgress}% quitado
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Debt cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {debts.map((debt) => (
                <div key={debt.id} className="relative group">
                  <DebtCard debt={toDebtData(debt)} />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => handleDeleteDebt(debt.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {debts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                  <CreditCard className="size-8 text-emerald-500/60" />
                </div>
                <h3 className="font-semibold">Sem dividas cadastradas</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Otimo! Ou cadastre suas dividas para acompanhar o progresso.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Metas ─────────────────────────────────────── */}
        <TabsContent value="metas">
          <div className="space-y-4">
            {/* Emergency fund — use debt summary for a simple goal */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <PiggyBank className="size-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold">Reserva de Emergencia</h3>
                    <p className="text-xs text-muted-foreground">
                      Meta: R$ 5.000,00
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
                    {saldo > 0 ? Math.min(100, Math.round((saldo / 5000) * 100)) : 0}%
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                      style={{
                        width: `${saldo > 0 ? Math.min(100, Math.round((saldo / 5000) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono tabular-nums text-emerald-500 font-bold">
                      R${' '}
                      {Math.max(0, saldo).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      R$ 5.000,00
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quitar dividas */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm glow-card">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                    <Target className="size-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold">Quitar Dividas</h3>
                    <p className="text-xs text-muted-foreground">
                      Total: R${' '}
                      {totalDebt.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'text-xs',
                      debtProgress < 50
                        ? 'bg-destructive/10 text-destructive border-destructive/30'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    )}
                  >
                    {debtProgress}%
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        debtProgress < 30
                          ? 'bg-gradient-to-r from-red-600 to-red-400'
                          : debtProgress < 60
                            ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      )}
                      style={{ width: `${debtProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono tabular-nums text-foreground font-bold">
                      R${' '}
                      {totalPaid.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      pago
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      R${' '}
                      {debtSummaryData.remaining.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      restante
                    </span>
                  </div>
                </div>

                {/* Per-debt mini progress */}
                {debts.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {debts.map((debt) => {
                        const pct =
                          debt.totalAmount > 0
                            ? Math.round(
                                (debt.paidAmount / debt.totalAmount) * 100
                              )
                            : 0;
                        return (
                          <div key={debt.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">
                                {debt.creditor}
                              </span>
                              <span className="font-mono tabular-nums text-muted-foreground">
                                {pct}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  pct >= 60
                                    ? 'bg-emerald-500'
                                    : pct >= 30
                                      ? 'bg-amber-500'
                                      : 'bg-destructive'
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
