import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  DimensionValue,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Navbar from '../../components/ui/Navbar';
import { useGoals } from '../../contexts/GoalsContext';
import { useTransactions } from '../../contexts/TransactionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useGoalsViewModel } from '../../viewmodels/useGoalsViewModel';
import { formatMoneyInput } from '../../../utils/money';

const OBJETIVOS_SUGERIDOS = [
  { id: '1', label: 'Viagem', icon: 'airplane' },
  { id: '2', label: 'Reserva', icon: 'shield-check' },
  { id: '3', label: 'Carro', icon: 'car' },
  { id: '4', label: 'Casa', icon: 'home' },
];

const CORES_METAS = ['#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6'];

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  color: string;
}

export default function GoalsScreen({ navigation }: any) {
  const { goals = [], addGoal, updateGoal } = useGoals();
  const { balance } = useTransactions();
  const { theme, colors } = useTheme();

  const vm = useGoalsViewModel(goals, balance, addGoal, updateGoal);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <Navbar theme={colors} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Espaçador zerado para corrigir o layout com a nova Navbar */}
        <View style={styles.navbarSpacer} />

        <View style={styles.pageHeader}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.pageTitle, { color: colors.text }]}>
            Minhas Metas
          </Text>
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View>
            <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
              Total guardado
            </Text>
            <Text style={[styles.heroValue, { color: colors.text }]}>
              {formatCurrency(vm.totalSaved)}
            </Text>
          </View>

          <View
            style={[
              styles.heroIconWrap,
              { backgroundColor: `${colors.accent}15` },
            ]}
          >
            <MaterialCommunityIcons
              name="piggy-bank"
              size={32}
              color={colors.accent}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.newGoalBtn, { borderColor: colors.accent }]}
          onPress={() => vm.setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={22} color={colors.accent} />
          <Text style={[styles.newGoalBtnText, { color: colors.accent }]}>
            Nova Meta Financeira
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Metas Ativas
        </Text>

        {goals.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons
              name="flag-variant-outline"
              size={40}
              color={colors.border}
            />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              Nenhuma meta ativa
            </Text>
          </View>
        ) : (
          goals.map((item: Goal) => {
            const progress =
              item.target > 0
                ? Math.min((item.current / item.target) * 100, 100)
                : 0;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  vm.setSelectedGoal(item);
                  vm.setDepositModal(true);
                }}
                activeOpacity={0.9}
                style={[
                  styles.goalCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.goalTop}>
                  <View style={styles.goalInfo}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.goalTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.goalSubtitle,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {formatCurrency(item.current)} de {formatCurrency(item.target)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.goalPercent, { color: item.color }]}>
                    {Math.round(progress)}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%` as DimensionValue,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL CRIAR META */}
      <Modal
        visible={vm.modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => vm.setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Novo Objetivo
                </Text>
                <TouchableOpacity onPress={() => vm.setModalVisible(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.highlightInput,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text
                  style={[styles.highlightLabel, { color: colors.textSecondary }]}
                >
                  VALOR ESTIPULADO
                </Text>
                <TextInput
                  style={[styles.hugeInput, { color: vm.selectedColor }]}
                  placeholder="R$ 0,00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={vm.target}
                  onChangeText={(t) => vm.setTarget(formatMoneyInput(t))}
                />
              </View>

              <Text style={[styles.innerLabel, { color: colors.textSecondary }]}>
                NOME DA META
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="Ex: Viagem, Carro, Reserva..."
                placeholderTextColor={colors.textSecondary}
                value={vm.title}
                onChangeText={vm.setTitle}
              />

              <View style={styles.chipsRow}>
                {OBJETIVOS_SUGERIDOS.map((obj) => (
                  <TouchableOpacity
                    key={obj.id}
                    style={[
                      styles.chip,
                      {
                        borderColor:
                          vm.title === obj.label ? colors.accent : colors.border,
                        backgroundColor:
                          vm.title === obj.label ? `${colors.accent}10` : 'transparent',
                      },
                    ]}
                    onPress={() => vm.setTitle(obj.label)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={obj.icon as any}
                      size={14}
                      color={
                        vm.title === obj.label
                          ? colors.accent
                          : colors.textSecondary
                      }
                    />
                    <Text style={[styles.chipText, { color: colors.text }]}>
                      {obj.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={[
                  styles.innerLabel,
                  { color: colors.textSecondary, marginTop: 15 },
                ]}
              >
                COR DE IDENTIFICAÇÃO
              </Text>

              <View style={styles.colorRow}>
                {CORES_METAS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: c,
                        borderWidth: vm.selectedColor === c ? 3 : 0,
                        borderColor: colors.text,
                      },
                    ]}
                    onPress={() => vm.setSelectedColor(c)}
                    activeOpacity={0.8}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: vm.selectedColor }]}
                onPress={vm.createGoal}
                activeOpacity={0.9}
              >
                <Text style={styles.btnText}>Criar Objetivo</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL DEPÓSITO */}
      <Modal
        visible={vm.depositModal}
        animationType="fade"
        transparent
        onRequestClose={() => vm.setDepositModal(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View
            style={[
              styles.depositContent,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons
              name="piggy-bank"
              size={48}
              color={vm.selectedGoal?.color || colors.accent}
            />

            <Text style={[styles.modalTitle, { color: colors.text, marginTop: 10 }]}>
              Guardar Dinheiro
            </Text>

            <Text style={[styles.depositSubtitle, { color: colors.textSecondary }]}>
              Saldo disponível: {formatCurrency(balance)}
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.depositInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="R$ 0,00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={vm.amountToSave}
              onChangeText={(t) => vm.setAmountToSave(formatMoneyInput(t))}
            />

            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[styles.btnSmall, { backgroundColor: colors.border }]}
                onPress={() => vm.setDepositModal(false)}
                activeOpacity={0.85}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnSmall,
                  {
                    backgroundColor: vm.selectedGoal?.color || colors.accent,
                    flex: 2,
                  },
                ]}
                onPress={vm.deposit}
                activeOpacity={0.9}
              >
                <Text style={styles.btnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbarSpacer: { height: 0 }, // Corrigido para 0 em ambas as plataformas
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20, marginTop: 16 }, // Adicionado marginTop para um respiro visual refinado
  backButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  pageTitle: { fontSize: 26, fontWeight: '900' },
  heroCard: { padding: 20, borderRadius: 24, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heroLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 5 },
  heroValue: { fontSize: 32, fontWeight: '900' },
  heroIconWrap: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  newGoalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 30 },
  newGoalBtnText: { marginLeft: 10, fontWeight: '800', fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15 },
  goalCard: { padding: 18, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  goalInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  colorIndicator: { width: 4, height: 30, borderRadius: 2, marginRight: 12 },
  goalTitle: { fontSize: 16, fontWeight: '800' },
  goalSubtitle: { fontSize: 12, marginTop: 2 },
  goalPercent: { fontSize: 16, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  depositContent: { padding: 25, borderRadius: 28, alignItems: 'center', borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  highlightInput: { padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  highlightLabel: { fontSize: 10, fontWeight: '800', marginBottom: 8 },
  hugeInput: { fontSize: 38, fontWeight: '900' },
  innerLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 15, fontSize: 16 },
  depositInput: { width: '100%', textAlign: 'center', fontSize: 24, fontWeight: '800' },
  depositSubtitle: { marginBottom: 20, marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, gap: 6 },
  chipText: { fontSize: 13, fontWeight: '700' },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
  colorDot: { width: 40, height: 40, borderRadius: 20 },
  btnAction: { padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  btnSmall: { padding: 15, borderRadius: 15, alignItems: 'center', flex: 1 },
  btnText: { color: '#FFF', fontWeight: '800' },
  footerRow: { flexDirection: 'row', gap: 10, width: '100%' },
  emptyState: { padding: 40, alignItems: 'center', opacity: 0.7, borderRadius: 24, borderWidth: 1 },
  emptyTitle: { marginTop: 10, fontWeight: '700' },
});