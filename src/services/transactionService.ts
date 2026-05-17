import { db } from '../infrastructure/firebase/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export interface TransactionDTO {
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  userId: string;
}

export const transactionService = {
  async create(data: TransactionDTO) {
    return await addDoc(collection(db, 'transactions'), {
      ...data,
      date: serverTimestamp(),
    });
  },

  async update(id: string, data: Partial<TransactionDTO>) {
    const ref = doc(db, 'transactions', id);
    return await updateDoc(ref, data);
  },

  async remove(id: string) {
    const ref = doc(db, 'transactions', id);
    return await deleteDoc(ref);
  },

  async getByUser(userId: string) {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};