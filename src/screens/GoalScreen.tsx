import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGoals } from '../context/GoalsContext';
import { useTransactions } from '../context/TransactionContext'; 
import { useTheme } from '../context/ThemeContext';

const OBJETIVOS_SUGERIDOS = [
  { id: '1', label: 'Reserva de Emergência', icon: 'shield-check-outline' },
  { id: '2', label: 'Viagem', icon: 'airplane' },
  { id: '3', label: 'Carro Novo', icon: 'car-outline' },
  { id: '4', label: 'Casa Própria', icon: 'home-outline' },
  { id: '5', label: 'Investimentos', icon: 'trending-up' },
  { id: '6', label: 'Aposentadoria', icon: 'palm-tree' },
];

const CORES_METAS = ['#16A34A', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function GoalsScreen({ navigation }: any) {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const { balance } = useTransactions(); 
  const { colors, theme } = useTheme();

  // Estados para Criação
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [selectedColor, setSelectedColor] = useState(CORES_METAS[0]);

  // Estados para Depósito
  const [depositModal, setDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [amountToSave, setAmountToSave] = useState('');

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = value ?? 0; 
    return safeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleMoneyChange = (text: string, setter: (v: string) => void) => {
    const numeric = text.replace(/\D/g, '');
    if (!numeric) return setter('');
    const floatValue = parseFloat(numeric) / 100;
    setter(floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  const handleCreateGoal = () => {
    const targetValue = parseFloat(target.replace(/\D/g, '')) / 100;
    if (!title || !targetValue) return Alert.alert("Erro", "Preencha o nome e o valor alvo.");
    addGoal({ title, target: targetValue, current: 0, color: selectedColor });
    setModalVisible(false);
    setTitle(''); setTarget('');
  };

  const handleDeposit = () => {
    const value = parseFloat(amountToSave.replace(/\D/g, '')) / 100;
    if (value > balance) {
      return Alert.alert("Saldo Insuficiente", `Você possui apenas ${formatCurrency(balance)} disponível.`);
    }
    if (selectedGoal) {
      const newTotal = (selectedGoal.current || 0) + value;
      updateGoal(selectedGoal.id, { current: newTotal });
      setDepositModal(false);
      setAmountToSave('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* HEADER AJUSTADO (Mais elegante e menos alto) */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Minhas Metas</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerBtn}>
          <Ionicons name="add-circle" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const progress = Math.min((item.current || 0) / (item.target || 1), 1);
          return (
            <View style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.goalHeader}>
                <Text style={[styles.goalTitle, { color: colors.text }]}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                   <TouchableOpacity onPress={() => { setSelectedGoal(item); setDepositModal(true); }}>
                     <Text style={{ color: item.color, fontWeight: 'bold' }}>Guardar</Text>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => {
                     Alert.alert("Excluir", "Deseja apagar esta meta?", [
                       { text: "Não", style: "cancel" },
                       { text: "Sim", style: "destructive", onPress: () => deleteGoal(item.id) }
                     ]);
                   }}>
                     <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                   </TouchableOpacity>
                </View>
              </View>
              
              <Text style={[styles.goalValues, { color: colors.textSecondary }]}>
                {formatCurrency(item.current)} de {formatCurrency(item.target)}
              </Text>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: item.color }]} />
              </View>
            </View>
          );
        }}
      />

      {/* MODAL CRIAR META */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Nova Meta</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                   <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.highlightValueBlock, { backgroundColor: colors.background }]}>
                  <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>QUANTO VOCÊ PRECISA?</Text>
                  <TextInput
                    style={[styles.hugeInput, { color: selectedColor }]}
                    placeholder="R$ 0,00"
                    placeholderTextColor={selectedColor + '50'}
                    keyboardType="numeric"
                    value={target}
                    onChangeText={(t) => handleMoneyChange(t, setTarget)}
                  />
                </View>

                <Text style={styles.innerLabel}>NOME DO OBJETIVO</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Ex: Viagem para o Japão"
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />

                <View style={styles.chipsContainer}>
                  {OBJETIVOS_SUGERIDOS.map(obj => (
                    <TouchableOpacity 
                      key={obj.id} 
                      style={[styles.chip, { borderColor: title === obj.label ? colors.accent : colors.border }]}
                      onPress={() => setTitle(obj.label)}
                    >
                      <MaterialCommunityIcons name={obj.icon as any} size={14} color={title === obj.label ? colors.accent : colors.textSecondary} />
                      <Text style={[styles.chipText, { color: title === obj.label ? colors.text : colors.textSecondary }]}>{obj.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.innerLabel, { marginTop: 10 }]}>ESCOLHA UMA COR</Text>
                <View style={styles.colorRow}>
                  {CORES_METAS.map(c => (
                    <TouchableOpacity 
                      key={c} 
                      style={[styles.colorDot, { backgroundColor: c, borderWidth: selectedColor === c ? 3 : 0, borderColor: colors.text }]} 
                      onPress={() => setSelectedColor(c)} 
                    />
                  ))}
                </View>

                <TouchableOpacity style={[styles.btn, { backgroundColor: selectedColor }]} onPress={handleCreateGoal}>
                  <Text style={styles.btnText}>Criar Objetivo</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL GUARDAR DINHEIRO */}
      <Modal visible={depositModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, alignItems: 'center' }]}>
            <MaterialCommunityIcons name="piggy-bank-outline" size={50} color={selectedGoal?.color || colors.accent} />
            <Text style={[styles.modalTitle, { color: colors.text, marginTop: 10 }]}>Guardar para {selectedGoal?.title}</Text>
            
            <View style={[styles.balanceBox, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Saldo Disponível</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{formatCurrency(balance)}</Text>
            </View>

            <TextInput
              style={[styles.hugeInput, { width: '100%', color: selectedGoal?.color || colors.accent, marginBottom: 20 }]}
              placeholder="R$ 0,00"
              keyboardType="numeric"
              value={amountToSave}
              onChangeText={(t) => handleMoneyChange(t, setAmountToSave)}
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.btn, { width: '100%', backgroundColor: selectedGoal?.color || colors.accent }]} 
              onPress={handleDeposit}
            >
              <Text style={styles.btnText}>Confirmar Depósito</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setDepositModal(false)}><Text style={{ marginTop: 20, color: colors.textSecondary }}>Voltar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    height: 60, // Altura padronizada (resolve a questão de estar "alta")
    paddingHorizontal: 15, 
    borderBottomWidth: 1 
  },
  headerBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  goalCard: { padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  goalTitle: { fontSize: 17, fontWeight: 'bold' },
  goalValues: { fontSize: 13, marginBottom: 12 },
  progressBarBg: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 25, borderRadius: 32 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  highlightValueBlock: { padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  highlightLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 5 },
  hugeInput: { fontSize: 36, fontWeight: '900', textAlign: 'center' },
  innerLabel: { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 8, marginLeft: 5 },
  input: { borderWidth: 1, borderRadius: 16, padding: 15, marginBottom: 15 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 15 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 10, marginLeft: 4, fontWeight: 'bold' },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  btn: { padding: 18, borderRadius: 18, alignItems: 'center', elevation: 2 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  balanceBox: { padding: 15, borderRadius: 16, width: '100%', alignItems: 'center', marginBottom: 10 }
});