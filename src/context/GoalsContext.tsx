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
import { db } from '../services/firebase'; 
import { useAuth } from './AuthContext';

export type Goal = {
  id: string;
  title: string;
  target: number; // Padronizado com a tela
  current: number; // Padronizado com a tela
  color: string;
  isPinned: boolean;
  userId: string;
  createdAt: any;
};

export type NewGoalInput = Omit<Goal, 'id' | 'userId' | 'isPinned' | 'createdAt'>;

interface GoalsContextData {
  goals: Goal[];
  addGoal: (goal: NewGoalInput) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>; // Função genérica para depósito/edição
  deleteGoal: (id: string) => Promise<void>; // ✨ Adicionada para resolver o erro
  pinGoal: (goalId: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextData>({} as GoalsContextData);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }

    const q = query(
      collection(db, 'goals'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc') // Organiza por data de criação
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const goalsData: Goal[] = [];
      querySnapshot.forEach((document) => {
        goalsData.push({ id: document.id, ...document.data() } as Goal);
      });
      setGoals(goalsData);
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goal: NewGoalInput) => {
    if (!user) return;
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
    }
  };

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    try {
      const goalRef = doc(db, 'goals', id);
      await updateDoc(goalRef, data);
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const goalRef = doc(db, 'goals', id);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
    }
  };

  const pinGoal = async (goalId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const pinnedQuery = query(collection(db, 'goals'), where('userId', '==', user.uid), where('isPinned', '==', true));
      const pinnedSnapshot = await getDocs(pinnedQuery);
      
      pinnedSnapshot.forEach((document) => {
         batch.update(doc(db, 'goals', document.id), { isPinned: false });
      });

      batch.update(doc(db, 'goals', goalId), { isPinned: true });
      await batch.commit();
    } catch (error) {
      console.error("Erro ao fixar meta:", error);
    }
  };

  return (
    <GoalsContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, pinGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

export const useGoals = () => useContext(GoalsContext);