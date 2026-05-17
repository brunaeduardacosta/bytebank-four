import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { parseValue } from '../../utils/money';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  color: string;
}

export function useGoalsViewModel(
  goals: Goal[],
  balance: number,
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>,
  updateGoal: (id: string, goal: Goal) => Promise<void>
) {
  const [modalVisible, setModalVisible] = useState(false);
  const [depositModal, setDepositModal] = useState(false);

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [selectedColor, setSelectedColor] = useState('#22C55E');

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [amountToSave, setAmountToSave] = useState('');

  const totalSaved = useMemo(
    () => goals.reduce((acc, g) => acc + (g.current || 0), 0),
    [goals]
  );

  const createGoal = async () => {
    const targetVal = parseValue(target);

    if (!title.trim() || targetVal <= 0) {
      return Alert.alert('Erro', 'Preencha corretamente.');
    }

    try {
      await addGoal({
        title: title.trim(),
        target: targetVal,
        current: 0,
        color: selectedColor,
      });

      setModalVisible(false);
      setTitle('');
      setTarget('');
      setSelectedColor('#22C55E');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a meta financeira.');
    }
  };

  const deposit = async () => {
    const value = parseValue(amountToSave);

    if (value <= 0) {
      return Alert.alert('Erro', 'Valor inválido');
    }

    if (value > balance) {
      return Alert.alert('Saldo insuficiente');
    }

    if (!selectedGoal) return;

    try {
      await updateGoal(selectedGoal.id, {
        ...selectedGoal,
        current: selectedGoal.current + value,
      });

      setDepositModal(false);
      setAmountToSave('');
      setSelectedGoal(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o dinheiro na meta.');
    }
  };

  return {
    modalVisible,
    setModalVisible,
    depositModal,
    setDepositModal,

    title,
    setTitle,
    target,
    setTarget,
    selectedColor,
    setSelectedColor,

    selectedGoal,
    setSelectedGoal,
    amountToSave,
    setAmountToSave,

    createGoal,
    deposit,
    totalSaved,
  };
}