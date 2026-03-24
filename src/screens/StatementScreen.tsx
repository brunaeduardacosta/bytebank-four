import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Modal, TextInput, Dimensions, FlatList, DimensionValue 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Tipagem para os itens de meta
interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function GoalsSection() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const goals: Goal[] = [
    { id: '1', title: 'Viagem Japão', target: 5000, current: 1200, icon: 'airplane' },
    { id: '2', title: 'Reserva de Emergência', target: 10000, current: 8500, icon: 'shield-check' },
  ];

  const GoalItem = ({ item }: { item: Goal }) => {
    // Cálculo de progresso limitado a 100%
    const progress = Math.min((item.current / item.target) * 100, 100);
    
    return (
      <View style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIconTitle}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.accent} />
            <Text style={[styles.goalTitle, { color: colors.text }]}>{item.title}</Text>
          </View>
          <Text style={[styles.goalPercent, { color: colors.accent }]}>{progress.toFixed(0)}%</Text>
        </View>
        
        {/* Progress Bar corrigida para TypeScript */}
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress}%` as DimensionValue, // Correção do Erro de Overload
                backgroundColor: colors.accent 
              }
            ]} 
          />
        </View>
        
        <View style={styles.goalFooter}>
          <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
            R$ {item.current.toLocaleString('pt-BR')} 
            <Text style={{ fontSize: 10 }}> de R$ {item.target.toLocaleString('pt-BR')}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* 1. CARD DE SALDO */}
      <View style={[styles.balanceCard, { backgroundColor: colors.accent }]}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text style={styles.balanceValue}>R$ 12.450,00</Text>
      </View>

      {/* 2. BOTÃO NOVA META */}
      <TouchableOpacity 
        style={[styles.addGoalBtn, { borderColor: colors.accent }]} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
        <Text style={[styles.addGoalText, { color: colors.accent }]}>Nova Meta Financeira</Text>
      </TouchableOpacity>

      {/* 3. SEÇÃO DE METAS ATUAIS */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Metas Atuais</Text>
        <TouchableOpacity activeOpacity={0.6}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <GoalItem item={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={false}
      />

      {/* 4. MODAL DE CRIAÇÃO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Definir Meta</Text>
            
            <TextInput 
              placeholder="Nome da meta (ex: Carro)" 
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            <TextInput 
              placeholder="Valor Alvo (R$)" 
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.saveBtnText}>Criar Meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  balanceCard: { padding: 25, borderRadius: 24, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceValue: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  addGoalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 30 },
  addGoalText: { marginLeft: 8, fontWeight: '700', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  goalCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalIconTitle: { flexDirection: 'row', alignItems: 'center' },
  goalTitle: { marginLeft: 10, fontWeight: '700', fontSize: 15 },
  goalPercent: { fontWeight: '800', fontSize: 14 },
  progressBg: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  goalFooter: { marginTop: 10 },
  goalValue: { fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, padding: 25, borderRadius: 30, elevation: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 14, padding: 15, marginBottom: 15, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 10 },
  cancelBtn: { padding: 15, flex: 1, alignItems: 'center' },
  saveBtn: { padding: 15, flex: 2, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 }
});