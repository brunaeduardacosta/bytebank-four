import { useMemo } from 'react';
import { useFinancialOverview } from '../../hooks/useFinancialOverview';
import { Transaction } from '../../types/transaction';

export function useDashboardViewModel(transactions: Transaction[]) {
  const financial = useFinancialOverview(transactions);

  const quickActions = useMemo(() => [
    { label: 'Nova receita', type: 'receita' },
    { label: 'Nova despesa', type: 'despesa' },
  ], []);

  return {
    financial,
    quickActions,
  };
}