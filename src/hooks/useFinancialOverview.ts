import { useMemo } from 'react';
import { Transaction } from '../types/transaction';

export function useFinancialOverview(transactions: Transaction[]) {
  return useMemo(() => {
    const safe = Array.isArray(transactions) ? transactions : [];

    let income = 0;
    let expense = 0;

    for (const t of safe) {
      const value = Number(t.amount || 0);

      if (t.type === 'receita') {
        income += value;
      } else {
        expense += value;
      }
    }

    const balance = income - expense;

    const recent = [...safe]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return { income, expense, balance, recent };
  }, [transactions]);
}