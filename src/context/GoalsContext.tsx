import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase'; 
import { useAuth } from './AuthContext';

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  isPinned: boolean;
  userId: string;
};

// Omitimos campos que o Firebase ou o Contexto geram sozinhos
export type NewGoalInput = Omit<Goal, 'id' | 'userId' | 'isPinned'>;

interface GoalsContextData {
  goals: Goal[];
  addGoal: (goal: NewGoalInput) => Promise<void>;
  addFunds: (goalId: string, amount: number) => Promise<void>;
  pinGoal: (goalId: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextData>({} as GoalsContextData);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { user } = useAuth();

  // --- 1. LER AS METAS EM TEMPO REAL ---
  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }

    // Busca apenas as metas do utilizador logado
    const q = query(collection(db, 'goals'), where('userId', '==', user.uid));
    
    // onSnapshot atualiza a tela automaticamente se o banco mudar
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const goalsData: Goal[] = [];
      querySnapshot.forEach((document) => {
        goalsData.push({ id: document.id, ...document.data() } as Goal);
      });
      setGoals(goalsData);
    });

    return () => unsubscribe();
  }, [user]);

  // --- 2. CRIAR UMA NOVA META NO FIREBASE ---
  const addGoal = async (goal: NewGoalInput) => {
    if (!user) return;
    
    try {
      // Se for a primeira meta criada, já a define como favorita por padrão
      const isFirstGoal = goals.length === 0;
      
      await addDoc(collection(db, 'goals'), {
        ...goal,
        userId: user.uid,
        isPinned: isFirstGoal,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Erro ao criar caixinha no Firebase: ", error);
    }
  };

  // --- 3. ADICIONAR FUNDOS À META (Futuro) ---
  const addFunds = async (goalId: string, amount: number) => {
    try {
      const goalRef = doc(db, 'goals', goalId);
      const goalToUpdate = goals.find(g => g.id === goalId);
      
      if (goalToUpdate) {
        await updateDoc(goalRef, {
          currentAmount: goalToUpdate.currentAmount + amount
        });
      }
    } catch (error) {
      console.error("Erro ao depositar dinheiro na caixinha: ", error);
    }
  };

  // --- 4. FAVORITAR UMA META (LÓGICA DE TROCA) ---
  const pinGoal = async (goalId: string) => {
    if (!user) return;
    
    try {
      // Usamos um "Lote" (Batch) para desfavoritar a antiga e favoritar a nova ao mesmo tempo
      const batch = writeBatch(db);

      // Encontra a meta que estava favoritada antes e remove a estrela
      const pinnedQuery = query(collection(db, 'goals'), where('userId', '==', user.uid), where('isPinned', '==', true));
      const pinnedSnapshot = await getDocs(pinnedQuery);
      
      pinnedSnapshot.forEach((document) => {
         batch.update(doc(db, 'goals', document.id), { isPinned: false });
      });

      // Coloca a estrela na nova meta escolhida
      batch.update(doc(db, 'goals', goalId), { isPinned: true });

      // Executa as duas ações juntas no banco
      await batch.commit();
    } catch (error) {
      console.error("Erro ao fixar meta no Firebase: ", error);
    }
  };

  return (
    <GoalsContext.Provider value={{ goals, addGoal, addFunds, pinGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

export const useGoals = () => useContext(GoalsContext);