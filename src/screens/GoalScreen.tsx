import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGoals, Goal } from '../context/GoalsContext';

export default function GoalsScreen({ navigation }: any) {
  const { goals, pinGoal, addFunds } = useGoals();
  
  // Estados para controlar o Modal de Depósito
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- LÓGICA DO MODAL ---
  const openDepositModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setDepositAmount(''); // Limpa o valor antigo
    setModalVisible(true);
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    const floatValue = parseFloat(numericValue) / 100;
    if (!isNaN(floatValue)) {
      setDepositAmount(floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    } else {
      setDepositAmount('');
    }
  };

  const confirmDeposit = async () => {
    if (!selectedGoal) return;
    
    const numericAmount = parseFloat(depositAmount.replace(/\D/g, '')) / 100;
    if (!numericAmount || numericAmount <= 0) {
      alert('Por favor, introduza um valor válido.');
      return;
    }

    await addFunds(selectedGoal.id, numericAmount);
    setModalVisible(false); // Fecha o modal após salvar
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Metas</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="bullseye-arrow" size={32} color="#47A138" />
          <Text style={styles.infoText}>Crie "caixinhas" para organizar seus objetivos financeiros e acompanhe seu progresso.</Text>
        </View>

        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? Math.min(goal.currentAmount / goal.targetAmount, 1) : 0;
          const progressPercent = (progress * 100).toFixed(0);

          return (
            <TouchableOpacity 
              key={goal.id} 
              style={styles.goalCard} 
              activeOpacity={0.8}
              onPress={() => openDepositModal(goal)} // <-- AGORA ABRE O MODAL!
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleArea}>
                  <View style={[styles.colorDot, { backgroundColor: goal.color }]} />
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.goalPercent, { color: goal.color, marginRight: 10 }]}>{`${progressPercent}%`}</Text>
                  
                  <TouchableOpacity onPress={() => pinGoal(goal.id)} style={{ padding: 4 }}>
                    <Ionicons 
                      name={goal.isPinned ? "star" : "star-outline"} 
                      size={24} 
                      color={goal.isPinned ? "#F59E0B" : "#cbd5e1"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { backgroundColor: goal.color, width: `${progress * 100}%` }]} />
              </View>

              <View style={styles.goalFooter}>
                <Text style={styles.goalAmount}>{`Guardado: ${formatCurrency(goal.currentAmount)}`}</Text>
                <Text style={styles.goalTarget}>{`Meta: ${formatCurrency(goal.targetAmount)}`}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => navigation.navigate('GoalForm')} >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* --- MODAL DE DEPÓSITO --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Botão de Fechar */}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>

            {selectedGoal && (
              <>
                <View style={[styles.modalIconCircle, { backgroundColor: selectedGoal.color + '1A' }]}>
                  <Ionicons name="wallet-outline" size={40} color={selectedGoal.color} />
                </View>
                
                <Text style={styles.modalTitle}>Guardar em <Text style={{ color: selectedGoal.color }}>{selectedGoal.title}</Text></Text>
                
                <TextInput
                  style={[styles.modalInput, { color: selectedGoal.color }]}
                  placeholder="R$ 0,00"
                  placeholderTextColor="#CBD5E1"
                  value={depositAmount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  autoFocus
                />

                <TouchableOpacity 
                  style={[styles.modalSaveBtn, { backgroundColor: selectedGoal.color }]} 
                  activeOpacity={0.8} 
                  onPress={confirmDeposit}
                >
                  <Text style={styles.modalSaveBtnText}>Confirmar Depósito</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  content: { padding: 20, paddingBottom: 100 },
  
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', padding: 15, borderRadius: 16, marginBottom: 25 },
  infoText: { flex: 1, marginLeft: 15, color: '#166534', fontSize: 14, fontWeight: '500', lineHeight: 20 },

  goalCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  goalTitleArea: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  goalTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  goalPercent: { fontSize: 16, fontWeight: '900' },
  
  progressTrack: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginBottom: 15 },
  progressFill: { height: '100%', borderRadius: 6 },
  
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalAmount: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  goalTarget: { fontSize: 13, fontWeight: '500', color: '#94A3B8' },

  fab: { position: 'absolute', bottom: 30, right: 25, width: 60, height: 60, backgroundColor: '#47A138', borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },

  // --- ESTILOS DO MODAL ---
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  modalCloseBtn: { position: 'absolute', top: 20, right: 20, padding: 5 },
  modalIconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 25 },
  modalInput: { width: '100%', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 20, fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  modalSaveBtn: { width: '100%', padding: 18, borderRadius: 16, alignItems: 'center' },
  modalSaveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});