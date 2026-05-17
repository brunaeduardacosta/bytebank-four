export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  date: Date; // 👈 padrão único
  userId: string;
  receiptUrl?: string | null;
}