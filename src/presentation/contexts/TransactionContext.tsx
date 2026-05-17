import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../infrastructure/firebase/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';

import { useAuth } from './AuthContext';
import { Transaction } from '../../types/transaction';

interface TransactionContextData {
  transactions: Transaction[];
  balance: number;
  addTransaction: (
    data: Omit<Transaction, 'id' | 'userId' | 'date'>
  ) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextData>(
  {} as TransactionContextData
);

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'receita'
      ? acc + curr.amount
      : acc - curr.amount;
  }, 0);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, 'id'>),
        date: doc.data().date?.toDate?.() || new Date(),
      }));

      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'date'>
  ) => {
    if (!user) return;

    await addDoc(collection(db, 'transactions'), {
      ...data,
      userId: user.uid,
      date: new Date(),
    });
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const ref = doc(db, 'transactions', id);
    await updateDoc(ref, data);
  };

  const deleteTransaction = async (id: string) => {
    const ref = doc(db, 'transactions', id);
    await deleteDoc(ref);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        balance,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        loading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);