/**
 * Finance Storage (Transactions & Debts)
 */
import {
  type StoredEntity,
  getCollection,
  create,
  update,
  remove,
  STORAGE_KEYS,
} from './index';

export type StoredTransaction = StoredEntity & {
  userId: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  date: string;
  recurring: boolean;
};

export type StoredDebt = StoredEntity & {
  userId: string;
  creditor: string;
  totalAmount: number;
  paidAmount: number;
  interestRate: number | null;
  deadline: string | null;
};

const TX_KEY = STORAGE_KEYS.TRANSACTIONS;
const DEBT_KEY = STORAGE_KEYS.DEBTS;

// --- Transactions ---

export function getTransactions(): StoredTransaction[] {
  return getCollection<StoredTransaction>(TX_KEY);
}

export function getTransactionsForMonth(
  yearMonth: string // 'YYYY-MM'
): StoredTransaction[] {
  return getTransactions().filter((t) => t.date.startsWith(yearMonth));
}

export function createTransaction(
  data: Omit<StoredTransaction, 'id' | 'createdAt'>
): StoredTransaction {
  return create<StoredTransaction>(TX_KEY, data);
}

export function updateTransaction(
  id: string,
  data: Partial<StoredTransaction>
): StoredTransaction | null {
  return update<StoredTransaction>(TX_KEY, id, data);
}

export function deleteTransaction(id: string): boolean {
  return remove<StoredTransaction>(TX_KEY, id);
}

// --- Debts ---

export function getDebts(): StoredDebt[] {
  return getCollection<StoredDebt>(DEBT_KEY);
}

export function createDebt(
  data: Omit<StoredDebt, 'id' | 'createdAt'>
): StoredDebt {
  return create<StoredDebt>(DEBT_KEY, data);
}

export function updateDebt(
  id: string,
  data: Partial<StoredDebt>
): StoredDebt | null {
  return update<StoredDebt>(DEBT_KEY, id, data);
}

export function deleteDebt(id: string): boolean {
  return remove<StoredDebt>(DEBT_KEY, id);
}

// --- Summaries ---

export function getMonthSummary(yearMonth: string): {
  receita: number;
  despesa: number;
  saldo: number;
  byCategory: Record<string, number>;
} {
  const txs = getTransactionsForMonth(yearMonth);

  let receita = 0;
  let despesa = 0;
  const byCategory: Record<string, number> = {};

  for (const tx of txs) {
    if (tx.type === 'receita') {
      receita += tx.amount;
    } else {
      despesa += tx.amount;
    }
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
  }

  return { receita, despesa, saldo: receita - despesa, byCategory };
}

export function getDebtSummary(): {
  total: number;
  paid: number;
  remaining: number;
} {
  const debts = getDebts();
  let total = 0;
  let paid = 0;

  for (const debt of debts) {
    total += debt.totalAmount;
    paid += debt.paidAmount;
  }

  return { total, paid, remaining: total - paid };
}
