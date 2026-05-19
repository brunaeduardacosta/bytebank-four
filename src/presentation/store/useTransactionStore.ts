import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../../types/transaction';

interface TransactionState {
  transactions: Transaction[];
  balance: number;
  setTransactions: (transactions: Transaction[]) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      balance: 0,
      setTransactions: (transactions) => {
        const balance = transactions.reduce((acc, curr) => {
          return curr.type === 'receita' ? acc + curr.amount : acc - curr.amount;
        }, 0);
        set({ transactions, balance });
      },
    }),
    {
      name: 'bytebank-transactions',
      storage: createJSONStorage(() => AsyncStorage),
      // Função para hidratar datas que voltam como string do AsyncStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.transactions = state.transactions.map(t => ({
            ...t,
            date: new Date(t.date) // Converte string de volta para Date
          }));
        }
      }
    }
  )
);
