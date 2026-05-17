import { Transaction } from '../types/transaction';

export const financialCalculator = {
  getIncome(transactions: Transaction[]) {
    return transactions.reduce((acc, t) => {
      return t.type === 'receita' ? acc + Number(t.amount || 0) : acc;
    }, 0);
  },

  getExpense(transactions: Transaction[]) {
    return transactions.reduce((acc, t) => {
      return t.type === 'despesa' ? acc + Number(t.amount || 0) : acc;
    }, 0);
  },

  getBalance(transactions: Transaction[]) {
    const income = this.getIncome(transactions);
    const expense = this.getExpense(transactions);
    return income - expense;
  },

  getRecent(transactions: Transaction[], limit = 5) {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, limit);
  },
};