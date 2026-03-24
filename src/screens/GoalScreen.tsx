import React, { useMemo, useState } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Navbar from '../components/ui/Navbar';
import { useGoals } from '../context/GoalsContext';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';

// --- CONSTANTES ---
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

  // Estados dos Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [depositModal, setDepositModal] = useState(false);

  // Estados de Criação
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [selectedColor, setSelectedColor] = useState(CORES_METAS[0]);

  // Estados de Depósito
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [amountToSave, setAmountToSave] = useState('');

  // --- HELPERS ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const handleMoneyChange = (text: string, setter: (v: string) => void) => {
    const cleanValue = text.replace(/\D/g, '');

    if (!cleanValue) {
      setter('');
      return;
    }

    const floatValue = parseFloat(cleanValue) / 100;

    setter(
      floatValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const parseValue = (formatted: string) => {
    if (!formatted) return 0;
    return parseFloat(formatted.replace(/\./g, '').replace(',', '.'));
  };

  const resetCreateModal = () => {
    setModalVisible(false);
    setTitle('');
    setTarget('');
    setSelectedColor(CORES_METAS[0]);
  };

  const resetDepositModal = () => {
    setDepositModal(false);
    setAmountToSave('');
    setSelectedGoal(null);
  };

  const handleCreateGoal = () => {
    const targetVal = parseValue(target);

    if (!title.trim() || targetVal <= 0) {
      return Alert.alert('Erro', 'Preencha os dados corretamente.');
    }

    addGoal({
      title: title.trim(),
      target: targetVal,
      current: 0,
      color: selectedColor,
    });

    resetCreateModal();
  };

  const handleDeposit = () => {
    const depositVal = parseValue(amountToSave);

    if (depositVal <= 0) {
      return Alert.alert('Erro', 'Digite um valor válido.');
    }

    if (depositVal > balance) {
      return Alert.alert('Erro', 'Saldo insuficiente.');
    }

    if (selectedGoal) {
      updateGoal(selectedGoal.id, {
        ...selectedGoal,
        current: (selectedGoal.current || 0) + depositVal,
      });

      resetDepositModal();
    }
  };

  const totalSaved = useMemo(
    () => goals.reduce((acc: number, g: Goal) => acc + (g.current || 0), 0),
    [goals]
  );

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
        {/* HEADER */}
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

        {/* HERO CARD */}
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
              {formatCurrency(totalSaved)}
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

        {/* BOTÃO NOVA META */}
        <TouchableOpacity
          style={[styles.newGoalBtn, { borderColor: colors.accent }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={22} color={colors.accent} />
          <Text style={[styles.newGoalBtnText, { color: colors.accent }]}>
            Nova Meta Financeira
          </Text>
        </TouchableOpacity>

        {/* LISTA DE METAS */}
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
                  setSelectedGoal(item);
                  setDepositModal(true);
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
                        width: `${progress}%`,
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
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={resetCreateModal}
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
                <TouchableOpacity onPress={resetCreateModal}>
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
                  VALOR DO ALVO
                </Text>
                <TextInput
                  style={[styles.hugeInput, { color: selectedColor }]}
                  placeholder="R$ 0,00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={target}
                  onChangeText={(t) => handleMoneyChange(t, setTarget)}
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
                value={title}
                onChangeText={setTitle}
              />

              <View style={styles.chipsRow}>
                {OBJETIVOS_SUGERIDOS.map((obj) => (
                  <TouchableOpacity
                    key={obj.id}
                    style={[
                      styles.chip,
                      {
                        borderColor:
                          title === obj.label ? colors.accent : colors.border,
                        backgroundColor:
                          title === obj.label ? `${colors.accent}10` : 'transparent',
                      },
                    ]}
                    onPress={() => setTitle(obj.label)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={obj.icon as any}
                      size={14}
                      color={
                        title === obj.label
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
                        borderWidth: selectedColor === c ? 3 : 0,
                        borderColor: colors.text,
                      },
                    ]}
                    onPress={() => setSelectedColor(c)}
                    activeOpacity={0.8}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: selectedColor }]}
                onPress={handleCreateGoal}
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
        visible={depositModal}
        animationType="fade"
        transparent
        onRequestClose={resetDepositModal}
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
              color={selectedGoal?.color || colors.accent}
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
              value={amountToSave}
              onChangeText={(t) => handleMoneyChange(t, setAmountToSave)}
            />

            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[styles.btnSmall, { backgroundColor: colors.border }]}
                onPress={resetDepositModal}
                activeOpacity={0.85}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnSmall,
                  {
                    backgroundColor: selectedGoal?.color || colors.accent,
                    flex: 2,
                  },
                ]}
                onPress={handleDeposit}
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
  container: {
    flex: 1,
  },

  // CORREÇÃO PRINCIPAL: removido o gap entre Navbar e conteúdo
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
  },

  heroCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  heroLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  heroValue: {
    fontSize: 32,
    fontWeight: '900',
  },

  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  newGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 30,
  },

  newGoalBtnText: {
    marginLeft: 10,
    fontWeight: '800',
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },

  goalCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },

  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  colorIndicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginRight: 12,
  },

  goalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  goalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  goalPercent: {
    fontSize: 16,
    fontWeight: '900',
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },

  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  depositContent: {
    padding: 25,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
  },

  highlightInput: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  highlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
  },

  hugeInput: {
    fontSize: 38,
    fontWeight: '900',
  },

  innerLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    fontSize: 16,
  },

  depositInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
  },

  depositSubtitle: {
    marginBottom: 20,
    marginTop: 4,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 5,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },

  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  btnAction: {
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },

  btnSmall: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
  },

  btnText: {
    color: '#FFF',
    fontWeight: '800',
  },

  footerRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },

  emptyState: {
    padding: 40,
    alignItems: 'center',
    opacity: 0.7,
    borderRadius: 24,
    borderWidth: 1,
  },

  emptyTitle: {
    marginTop: 10,
    fontWeight: '700',
  },
});