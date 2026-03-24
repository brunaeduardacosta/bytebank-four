import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/ui/Navbar';

const CATEGORIAS = {
  RECEITA: [
    { id: 'salario', label: 'Salário', icon: 'cash' },
    { id: 'freelance', label: 'Freelance', icon: 'laptop' },
    { id: 'investimento', label: 'Investimento', icon: 'trending-up' },
    { id: 'presente', label: 'Presente', icon: 'gift' },
    { id: 'venda', label: 'Venda', icon: 'tag-outline' },
    { id: 'outros_rec', label: 'Outros', icon: 'dots-horizontal' },
  ],
  DESPESA: [
    { id: 'alimentacao', label: 'Alimentação', icon: 'food' },
    { id: 'mercado', label: 'Mercado', icon: 'cart-outline' },
    { id: 'transporte', label: 'Transporte', icon: 'car' },
    { id: 'combustivel', label: 'Combustível', icon: 'gas-station' },
    { id: 'lazer', label: 'Lazer', icon: 'beach' },
    { id: 'saude', label: 'Saúde', icon: 'medical-bag' },
    { id: 'educacao', label: 'Educação', icon: 'school' },
    { id: 'moradia', label: 'Moradia', icon: 'home' },
    { id: 'contas', label: 'Contas', icon: 'file-document-outline' },
    { id: 'compras', label: 'Compras', icon: 'shopping-outline' },
    { id: 'assinaturas', label: 'Assinaturas', icon: 'youtube-subscription' },
    { id: 'pets', label: 'Pets', icon: 'dog' },
    { id: 'outros_desp', label: 'Outros', icon: 'dots-horizontal' },
  ],
};

export default function TransactionFormScreen({ route, navigation }: any) {
  const { type = 'despesa', transaction } = route.params || {};
  const isEditing = !!transaction;
  const isReceita = type === 'receita';

  const { user } = useAuth();
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { colors, theme } = useTheme();

  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(
    transaction?.amount ? String(Math.round(Number(transaction.amount) * 100)) : ''
  );
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(transaction?.category || '');
  const [receiptImage, setReceiptImage] = useState<string | null>(
    transaction?.receiptUrl || null
  );
  const [isSaving, setIsSaving] = useState(false);

  const ui = useMemo(() => {
    const main = isReceita ? '#10B981' : '#EF4444';

    return {
      main,
      soft: `${main}1A`,
      categories: isReceita ? CATEGORIAS.RECEITA : CATEGORIAS.DESPESA,
    };
  }, [isReceita]);

  const numericAmount = useMemo(() => {
    return parseFloat(amount || '0') / 100;
  }, [amount]);

  const displayAmount = useMemo(() => {
    return numericAmount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }, [numericAmount]);

  const handleMoneyChange = (text: string) => {
    setAmount(text.replace(/\D/g, ''));
  };

  const handlePickImage = useCallback(() => {
    Alert.alert('Comprovante', 'Escolha uma opção', [
      {
        text: 'Câmera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();

          if (status !== 'granted') {
            return Alert.alert('Erro', 'Acesso à câmera negado.');
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.6,
          });

          if (!result.canceled) {
            setReceiptImage(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (status !== 'granted') {
            return Alert.alert('Erro', 'Acesso à galeria negado.');
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.6,
          });

          if (!result.canceled) {
            setReceiptImage(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, []);

  const handleDelete = useCallback(() => {
    if (!transaction?.id) return;

    Alert.alert('Excluir', 'Deseja apagar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transaction.id);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          navigation.goBack();
        },
      },
    ]);
  }, [transaction?.id, deleteTransaction, navigation]);

  const handleSave = async () => {
    if (!selectedCategory || numericAmount <= 0) {
      return Alert.alert('Erro', 'Preencha valor e categoria.');
    }

    setIsSaving(true);

    try {
      let finalUrl = receiptImage;

      if (
        receiptImage &&
        (receiptImage.startsWith('file://') || receiptImage.startsWith('content://'))
      ) {
        const response = await fetch(receiptImage);
        const blob = await response.blob();

        const fileRef = ref(
          getStorage(),
          `receipts/${user?.uid || 'guest'}/${Date.now()}.jpg`
        );

        await uploadBytes(fileRef, blob);
        finalUrl = await getDownloadURL(fileRef);
      }

      const data = {
        description: description.trim() || (isReceita ? 'Receita' : 'Despesa'),
        amount: numericAmount,
        date: date.toISOString(),
        category: selectedCategory,
        receiptUrl: finalUrl,
        type,
      };

      if (isEditing && transaction?.id) {
        await updateTransaction(transaction.id, data);
      } else {
        await addTransaction(data);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* NAVBAR */}
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
          {/* HEADER DA TELA */}
          <View style={styles.screenHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                styles.actionCircle,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.screenHeaderCenter}>
              <Text
                style={[
                  styles.screenOverline,
                  { color: colors.textSecondary },
                ]}
              >
                {isEditing ? 'Edição' : 'Novo registro'}
              </Text>

              <Text style={[styles.screenTitle, { color: colors.text }]}>
                {isReceita ? 'Receita' : 'Despesa'}
              </Text>
            </View>

            {isEditing ? (
              <TouchableOpacity
                onPress={handleDelete}
                style={[
                  styles.actionCircle,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.danger || '#EF4444'}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.actionPlaceholder} />
            )}
          </View>

          {/* HERO */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
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

              <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
                Valor
              </Text>
            </View>

            <TextInput
              style={[styles.amountInput, { color: ui.main }]}
              value={displayAmount}
              onChangeText={handleMoneyChange}
              keyboardType="numeric"
              placeholder="R$ 0,00"
              placeholderTextColor={`${ui.main}40`}
            />

            <View style={[styles.miniInsight, { backgroundColor: ui.soft }]}>
              <Ionicons name="calendar-outline" size={14} color={ui.main} />
              <Text style={[styles.miniInsightText, { color: ui.main }]}>
                {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </Text>
            </View>
          </View>

          {/* FORM */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Detalhes
            </Text>

            <View
              style={[
                styles.inputShell,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="O que é?"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.inputShell,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  marginTop: 12,
                },
              ]}
            >
              <Ionicons
                name="calendar-clear-outline"
                size={20}
                color={ui.main}
              />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {format(date, 'dd/MM/yyyy')}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textSecondary, marginTop: 24 },
              ]}
            >
              Categoria
            </Text>

            <View style={styles.categoryGrid}>
              {ui.categories.map((item) => {
                const isSelected = selectedCategory === item.label;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCategory(item.label);
                    }}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected
                          ? ui.soft
                          : colors.background,
                        borderColor: isSelected ? ui.main : colors.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={20}
                      color={isSelected ? ui.main : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: isSelected
                            ? colors.text
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* RECIBO */}
          <View
            style={[
              styles.receiptCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.receiptHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recibo
              </Text>

              <TouchableOpacity onPress={handlePickImage}>
                <Text style={[styles.receiptAction, { color: ui.main }]}>
                  {receiptImage ? 'Trocar' : 'Anexar'}
                </Text>
              </TouchableOpacity>
            </View>

            {receiptImage ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: receiptImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setReceiptImage(null)}
                >
                  <Ionicons name="trash" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.receiptPlaceholder,
                  { borderColor: colors.border },
                ]}
                onPress={handlePickImage}
              >
                <Ionicons
                  name="camera-outline"
                  size={28}
                  color={colors.textSecondary}
                />
                <Text
                  style={{
                    color: colors.textSecondary,
                    marginTop: 8,
                    fontSize: 12,
                  }}
                >
                  Toque para anexar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: ui.main,
                opacity: isSaving ? 0.7 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Confirmar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120,
  },

  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  screenHeaderCenter: {
    flex: 1,
    marginHorizontal: 15,
  },

  screenOverline: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.7,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },

  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  actionPlaceholder: {
    width: 44,
    height: 44,
  },

  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  heroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  amountInput: {
    fontSize: 36,
    fontWeight: '800',
  },

  miniInsight: {
    marginTop: 15,
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  miniInsightText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    opacity: 0.7,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  inputShell: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
  },

  dateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryChip: {
    width: '48%',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
  },

  receiptCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },

  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },

  receiptAction: {
    fontSize: 13,
    fontWeight: '700',
  },

  receiptPlaceholder: {
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imagePreviewWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
  },

  saveButton: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});