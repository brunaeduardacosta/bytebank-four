import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { formatCurrency, parseCurrencyInput } from '../utils/currency';

interface Params {
  initialDescription?: string;
  initialAmount?: number;
  initialDate?: Date;
  initialCategory?: string;
  isReceita: boolean;
}

export function useTransactionForm({
  initialDescription = '',
  initialAmount,
  initialDate = new Date(),
  initialCategory = '',
  isReceita,
}: Params) {
  const [description, setDescription] = useState(initialDescription);

  const [amount, setAmount] = useState(
    initialAmount ? String(Math.round(initialAmount * 100)) : ''
  );

  const [date, setDate] = useState(initialDate);

  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);

  const numericAmount = useMemo(() => {
    return parseFloat(amount || '0') / 100;
  }, [amount]);

  const displayAmount = useMemo(() => {
    return formatCurrency(numericAmount);
  }, [numericAmount]);

  const finalDescription = useMemo(() => {
    return description.trim() || (isReceita ? 'Receita' : 'Despesa');
  }, [description, isReceita]);

  const handleMoneyChange = (text: string) => {
    setAmount(parseCurrencyInput(text));
  };

  const validateForm = () => {
    if (!selectedCategory) {
      Alert.alert('Erro', 'Selecione uma categoria.');
      return false;
    }

    if (numericAmount <= 0) {
      Alert.alert('Erro', 'Valor inválido.');
      return false;
    }

    return true;
  };

  return {
    // states
    description,
    setDescription,
    amount,
    date,
    setDate,
    selectedCategory,
    setSelectedCategory,

    // derived
    numericAmount,
    displayAmount,
    finalDescription,

    // actions
    handleMoneyChange,
    validateForm,
  };
}