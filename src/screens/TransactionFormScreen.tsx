import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import correto

// Firebase Storage para os recibos
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const CATEGORIAS_RECEITA = [
  { id: 'salario', label: 'Salário', icon: 'cash' },
  { id: 'freelance', label: 'Freelance', icon: 'laptop' },
  { id: 'investimento', label: 'Investimento', icon: 'trending-up' },
  { id: 'presente', label: 'Presente', icon: 'gift' },
  { id: 'venda', label: 'Venda de Item', icon: 'tag-outline' },
  { id: 'outros_rec', label: 'Outros', icon: 'dots-horizontal' },
];

const CATEGORIAS_DESPESA = [
  { id: 'alimentacao', label: 'Alimentação', icon: 'food' },
  { id: 'mercado', label: 'Supermercado', icon: 'cart-outline' },
  { id: 'transporte', label: 'Transporte', icon: 'car' },
  { id: 'combustivel', label: 'Combustível', icon: 'gas-station' },
  { id: 'lazer', label: 'Lazer/Viagem', icon: 'beach' },
  { id: 'saude', label: 'Saúde', icon: 'medical-bag' },
  { id: 'educacao', label: 'Educação', icon: 'school' },
  { id: 'moradia', label: 'Moradia', icon: 'home' },
  { id: 'contas', label: 'Contas Fixas', icon: 'file-document-outline' },
  { id: 'compras', label: 'Vestuário', icon: 'tshirt-crew' },
  { id: 'assinaturas', label: 'Streaming/Apps', icon: 'youtube-subscription' },
  { id: 'pets', label: 'Pets', icon: 'dog' },
  { id: 'outros_desp', label: 'Outros', icon: 'dots-horizontal' },
];

export default function TransactionFormScreen({ route, navigation }: any) {
  const { type, transaction } = route.params;
  const isEditing = !!transaction;

  const { user } = useAuth();
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { colors } = useTheme();

  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount ? 
    transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
  const [selectedCategory, setSelectedCategory] = useState(transaction?.category || '');
  const [receiptImage, setReceiptImage] = useState<string | null>(transaction?.receiptUrl || null);
  const [isSaving, setIsSaving] = useState(false);

  const isReceita = type === 'receita';
  const mainColor = isReceita ? '#16A34A' : '#DC2626';
  const bgColor = isReceita ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)';
  const categoriasAtuais = isReceita ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  // Lógica de Máscara Profissional (Direita para Esquerda)
  const handleMoneyChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    const floatValue = parseFloat(numericValue) / 100;
    if (!isNaN(floatValue)) {
      setAmount(floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    } else { setAmount(''); }
  };

  const handlePickImage = () => {
    Alert.alert("Anexar Comprovante", "Escolha a origem:", [
      { text: "Câmera", onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
        if (!result.canceled) setReceiptImage(result.assets[0].uri);
      }},
      { text: "Galeria", onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
        if (!result.canceled) setReceiptImage(result.assets[0].uri);
      }},
      { text: "Cancelar", style: "cancel" }
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Excluir Transação", "Deseja apagar este registro?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", style: "destructive", onPress: async () => {
          await deleteTransaction(transaction.id);
          navigation.goBack();
      }}
    ]);
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount.replace(/\D/g, '')) / 100;
    if (!selectedCategory || !numericAmount) return Alert.alert('Atenção', 'Preencha valor e categoria.');

    setIsSaving(true);
    try {
      let finalReceiptUrl = receiptImage;
      if (receiptImage && (receiptImage.startsWith('file') || receiptImage.startsWith('ph'))) {
        const response = await fetch(receiptImage);
        const blob = await response.blob();
        const storage = getStorage();
        const fileRef = ref(storage, `receipts/${user?.uid}/${Date.now()}`);
        await uploadBytes(fileRef, blob);
        finalReceiptUrl = await getDownloadURL(fileRef);
      }

      const payload = {
          description: description.trim() || 'Sem descrição',
          amount: numericAmount,
          type: (isReceita ? 'receita' : 'despesa') as 'receita' | 'despesa',
          category: selectedCategory,
          receiptUrl: finalReceiptUrl,
          };

      if (isEditing) {
        await updateTransaction(transaction.id, payload);
      } else {
        await addTransaction(payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* HEADER PADRONIZADO (60px) */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Editar' : 'Nova'} {isReceita ? 'Receita' : 'Despesa'}
        </Text>
        <View style={styles.headerRight}>
          {isEditing && (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 15 }}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={24} color={mainColor} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* BLOCO DE VALOR DESTAQUE (IGUAL ÀS METAS) */}
          <View style={[styles.amountContainer, { backgroundColor: bgColor, borderColor: mainColor }]}>
            <Text style={[styles.amountLabel, { color: mainColor }]}>Quanto foi o valor?</Text>
            <TextInput
              style={[styles.amountInput, { color: mainColor }]}
              placeholder="R$ 0,00"
              placeholderTextColor={mainColor + '50'}
              value={amount}
              onChangeText={handleMoneyChange}
              keyboardType="numeric"
              autoFocus={!isEditing}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORIA</Text>
            <View style={styles.categoryGrid}>
              {categoriasAtuais.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[
                    styles.categoryChip,
                    { 
                        backgroundColor: colors.card, 
                        borderColor: selectedCategory === item.label ? mainColor : colors.border,
                        borderWidth: selectedCategory === item.label ? 2 : 1 
                    }
                  ]}
                  onPress={() => setSelectedCategory(item.label)}
                >
                  <MaterialCommunityIcons 
                    name={item.icon as any} 
                    size={20} 
                    color={selectedCategory === item.label ? mainColor : colors.textSecondary} 
                  />
                  <Text style={[styles.categoryChipText, { color: selectedCategory === item.label ? colors.text : colors.textSecondary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIÇÃO</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Ex: Almoço de domingo, Venda OLX..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>COMPROVANTE</Text>
            {receiptImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: receiptImage }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImage} onPress={() => setReceiptImage(null)}>
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.attachBtn, { borderColor: colors.border }]} onPress={handlePickImage}>
                <Ionicons name="document-attach-outline" size={22} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, marginLeft: 10, fontWeight: '700', fontSize: 13 }}>Anexar Recibo</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: mainColor }]} 
            onPress={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{isEditing ? 'Salvar Alterações' : 'Confirmar Transação'}</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    height: 60, 
    paddingHorizontal: 15, 
    borderBottomWidth: 1 
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  content: { padding: 25 },
  amountContainer: { padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 30, borderWidth: 1 },
  amountLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 5, letterSpacing: 0.5 },
  amountInput: { fontSize: 36, fontWeight: '900', textAlign: 'center', width: '100%' },
  formGroup: { marginBottom: 30 },
  label: { fontSize: 11, fontWeight: '900', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
  input: { borderWidth: 1, borderRadius: 16, padding: 18, fontSize: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, borderRadius: 16, minWidth: '48%' },
  categoryChipText: { fontSize: 12, fontWeight: 'bold', marginLeft: 10 },
  attachBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 22, borderRadius: 18, borderStyle: 'dashed', borderWidth: 2 },
  imagePreviewContainer: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImage: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 20 },
  footer: { padding: 20, borderTopWidth: 1 },
  saveBtn: { padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', height: 60, elevation: 3 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});