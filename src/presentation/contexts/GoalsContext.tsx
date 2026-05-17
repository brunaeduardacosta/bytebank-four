import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  updateDoc, 
  doc, 
  getDocs, 
  writeBatch, 
  deleteDoc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase/firebase'; 
import { useAuth } from './AuthContext';

// 1. Tipagem Rigorosa
export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  color: string;
  isPinned: boolean;
  userId: string;
  createdAt: Date; // Substituído 'any' por 'Date' garantido
}

export type NewGoalInput = Omit<Goal, 'id' | 'userId' | 'isPinned' | 'createdAt'>;

interface GoalsContextData {
  goals: Goal[];
  loading: boolean; // Adicionado para manter o padrão das outras telas
  addGoal: (goal: NewGoalInput) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  pinGoal: (goalId: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextData>({} as GoalsContextData);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'goals'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const goalsData = querySnapshot.docs.map((document) => {
        const firestoreData = document.data();
        return {
          id: document.id,
          ...firestoreData,
          // 2. Conversão segura do Timestamp do Firebase para Date do JS
          createdAt: firestoreData.createdAt?.toDate() || new Date(),
        } as Goal;
      });
      
      setGoals(goalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goal: NewGoalInput) => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
      const isFirstGoal = goals.length === 0;
      await addDoc(collection(db, 'goals'), {
        ...goal,
        userId: user.uid,
        isPinned: isFirstGoal,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      throw error; // Permite que a UI capture e mostre um Alert
    }
  };

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    try {
      const goalRef = doc(db, 'goals', id);
      
      // Tratamento de segurança caso a data venha no update
      const updateData = { ...data };
      if (updateData.createdAt && !(updateData.createdAt instanceof Date)) {
        updateData.createdAt = new Date(updateData.createdAt);
      }

      await updateDoc(goalRef, updateData);
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const goalRef = doc(db, 'goals', id);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      throw error;
    }
  };

  const pinGoal = async (goalId: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    try {
      const batch = writeBatch(db);
      
      // Busca a meta que está atualmente fixada para desfixá-la
      const pinnedQuery = query(
        collection(db, 'goals'), 
        where('userId', '==', user.uid), 
        where('isPinned', '==', true)
      );
      const pinnedSnapshot = await getDocs(pinnedQuery);
      
      pinnedSnapshot.forEach((document) => {
         batch.update(doc(db, 'goals', document.id), { isPinned: false });
      });

      // Fixa a nova meta
      batch.update(doc(db, 'goals', goalId), { isPinned: true });
      await batch.commit();
    } catch (error) {
      console.error("Erro ao fixar meta:", error);
      throw error;
    }
  };

  return (
    <GoalsContext.Provider value={{ goals, loading, addGoal, updateGoal, deleteGoal, pinGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

export const useGoals = () => useContext(GoalsContext);