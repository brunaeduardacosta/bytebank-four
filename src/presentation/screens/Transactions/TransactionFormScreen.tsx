import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTransactions } from '../../contexts/TransactionContext';
import { useTheme } from '../../contexts/ThemeContext';
import Navbar from '../../components/ui/Navbar';
import { CATEGORIAS } from '../../../constants/categories';

import { useTransactionForm } from '../../../hooks/useTransactionForm';
import { useReceiptImage } from '../../../hooks/useReceiptImage';

import { CategoryChip } from '../../components/transactions/CategoryChip';
import { CurrencyInput } from '../../components/transactions/CurrencyInput';
import { ReceiptPicker } from '../../components/transactions/ReceiptPicker';
import { ConfirmModal } from '../../components/transactions/ConfirmModal';

import { formatDate, formatFullDate } from '../../../utils/date';

export default function TransactionFormScreen({ route, navigation }: any) {
  const { type = 'despesa', transaction } = route.params || {};
  const isEditing = !!transaction;
  const isReceita = type === 'receita';

  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { colors, theme } = useTheme();

  const form = useTransactionForm({
    initialDescription: transaction?.description,
    initialAmount: transaction?.amount,
    initialDate: transaction?.date ? new Date(transaction.date) : new Date(),
    initialCategory: transaction?.category,
    isReceita,
  });

  const {
    receiptImage,
    setReceiptImage,
    handlePickImage,
  } = useReceiptImage(transaction?.receiptUrl);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const ui = React.useMemo(() => {
    const main = isReceita ? '#10B981' : '#EF4444';
    return {
      main,
      soft: `${main}1A`,
      categories: isReceita ? CATEGORIAS.RECEITA : CATEGORIAS.DESPESA,
    };
  }, [isReceita]);

  const handleOpenConfirmModal = () => {
    const isValid = form.validateForm();
    if (!isValid) return;
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);

    try {
      const data = {
        description: form.finalDescription,
        amount: form.numericAmount,
        date: form.date,
        category: form.selectedCategory,
        receiptUrl: receiptImage,
        type,
      };

      if (isEditing && transaction?.id) {
        await updateTransaction(transaction.id, data);
      } else {
        await addTransaction(data);
      }

      navigation.goBack();
    } catch (error) {
      console.log('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!transaction?.id) return;
    Alert.alert('Excluir', 'Deseja apagar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transaction.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <Navbar theme={colors} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.screenHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.actionCircle, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.screenHeaderCenter}>
              <Text style={[styles.screenOverline, { color: colors.textSecondary }]}>
                {isEditing ? 'Edição' : 'Novo registro'}
              </Text>
              <Text style={[styles.screenTitle, { color: colors.text }]}>
                {isReceita ? 'Receita' : 'Despesa'}
              </Text>
            </View>

            {isEditing ? (
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.actionCircle, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger || '#EF4444'} />
              </TouchableOpacity>
            ) : (
              <View style={styles.actionPlaceholder} />
            )}
          </View>

          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.heroTopRow}>
              <View style={[styles.heroBadge, { backgroundColor: ui.soft }]}>
                <MaterialCommunityIcons
                  name={isReceita ? 'arrow-down-left' : 'arrow-up-right'}
                  size={14}
                  color={ui.main}
                />
                <Text style={[styles.heroBadgeText, { color: ui.main }]}>
                  {isReceita ? 'Entrada' : 'Saída'}
                </Text>
              </View>
              <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Valor</Text>
            </View>

            <CurrencyInput
              value={form.amount}
              displayValue={form.displayAmount}
              color={ui.main}
              onChange={form.handleMoneyChange}
            />

            <View style={[styles.miniInsight, { backgroundColor: ui.soft }]}>
              <Ionicons name="calendar-outline" size={14} color={ui.main} />
              <Text style={[styles.miniInsightText, { color: ui.main }]}>
                {formatFullDate(form.date)}
              </Text>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Detalhes</Text>

            <View style={[styles.inputShell, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="O que é?"
                placeholderTextColor={colors.textSecondary}
                value={form.description}
                onChangeText={form.setDescription}
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.inputShell, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 12 }]}
            >
              <Ionicons name="calendar-clear-outline" size={20} color={ui.main} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(form.date)}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={form.date}
                mode="date"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) form.setDate(selectedDate);
                }}
              />
            )}

            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 24 }]}>
              Categoria
            </Text>

            <View style={styles.categoryGrid}>
              {ui.categories.map((item) => (
                <CategoryChip
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  selected={form.selectedCategory === item.label}
                  color={ui.main}
                  background={ui.soft}
                  onPress={() => form.setSelectedCategory(item.label)}
                />
              ))}
            </View>
          </View>

          <ReceiptPicker
            image={receiptImage}
            onPick={handlePickImage}
            onRemove={() => setReceiptImage(null)}
            colors={colors}
          />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: ui.main }]}
            onPress={handleOpenConfirmModal}
          >
            <Text style={styles.saveButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleSave}
        loading={isSaving}
        title="Confirmar transação"
        subtitle="Revise os dados antes de salvar"
        colors={colors}
      >
        <View style={styles.summaryItem}>
          <Text style={{ color: colors.textSecondary }}>Valor: </Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{form.displayAmount}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={{ color: colors.textSecondary }}>Categoria: </Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{form.selectedCategory || '-'}</Text>
        </View>
      </ConfirmModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 120 },
  screenHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  screenHeaderCenter: { flex: 1, marginHorizontal: 15 },
  screenOverline: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', opacity: 0.7 },
  screenTitle: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  actionCircle: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actionPlaceholder: { width: 44, height: 44 },
  heroCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 16 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  heroBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  heroBadgeText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  heroLabel: { fontSize: 12, fontWeight: '600' },
  miniInsight: { marginTop: 15, padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  miniInsightText: { marginLeft: 8, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  formCard: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, opacity: 0.7 },
  inputShell: { height: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  textInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  dateText: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  footer: { padding: 20, borderTopWidth: 1 },
  saveButton: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }
});