import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

// --- INTERFACES ---
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string; // Afrouxamos a tipagem aqui para lidar com maiúsculas/minúsculas do banco
  category: string;
  date: Date;
  receiptUrl?: string; 
}

interface TransactionContextData {
  transactions: Transaction[];
  loading: boolean;
  balance: number;
  addTransaction: (data: Omit<Transaction, "id" | "date" | "receiptUrl">, imageBase64?: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextData>({} as TransactionContextData);

// --- PROVIDER ---
export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 1. CÁLCULO DO SALDO TOTAL (Agora BLINDADO contra erros de digitação/maiúsculas)
  const balance = useMemo(() => {
    return transactions.reduce((acc, current) => {
      // Pega o tipo, transforma em minúsculo e tira espaços extras
      const tipoNormalizado = String(current.type).toLowerCase().trim();
      
      // Garante que o valor é um número válido para evitar 'NaN'
      const valor = Number(current.amount) || 0;

      // Se for receita ou entrada, SOMA
      if (tipoNormalizado === 'receita' || tipoNormalizado === 'entrada') {
        return acc + valor;
      }
      
      // Qualquer outra coisa (despesa, saida, etc), SUBTRAI
      return acc - valor;
    }, 0);
  }, [transactions]);

  // 2. BUSCA EM TEMPO REAL NO FIRESTORE
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc") 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Garante a conversão da data
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(),
        };
      }) as Transaction[];

      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao sincronizar Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. FUNÇÃO PARA ADICIONAR NOVA TRANSAÇÃO
  const addTransaction = async (data: Omit<Transaction, "id" | "date" | "receiptUrl">, imageBase64?: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      // Força o tipo a ficar minúsculo antes de ir para o banco, padronizando os dados
      const tipoPadronizado = String(data.type).toLowerCase().trim();

      await addDoc(collection(db, "transactions"), {
        ...data,
        type: tipoPadronizado, 
        userId: user.uid,
        date: Timestamp.fromDate(new Date()),
        receiptUrl: imageBase64 || null 
      });
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      throw error;
    }
  };

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      loading, 
      balance, 
      addTransaction 
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);