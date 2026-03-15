import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase'; 
import { useTransactions } from '../context/TransactionContext';

// --- LISTAS DE CATEGORIAS PADRÃO ---
const EXPENSE_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Contas', 'Compras'];
const INCOME_CATEGORIES = ['Salário', 'Pix', 'Investimentos', 'Vendas', 'Cashback', 'Outros'];

export default function TransactionFormScreen({ navigation }: any) {
  const { addTransaction } = useTransactions();
  
  // Estados de Dados
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Estados de Categoria
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');
  
  // Estados de Arquivo/UX
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Troca de tipo (limpa a categoria ao trocar entre receita/despesa)
  const handleTypeChange = (newType: 'receita' | 'despesa') => {
    setType(newType);
    setSelectedCategory('');
    setIsCustomCategory(false);
    setCustomCategoryText('');
  };

  // Abrir Câmera/Galeria
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ops!', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4, 
      base64: true, 
    });

    if (!result.canceled && result.assets[0].base64) {
      setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // Validação e Envio para o Firebase
  const handleSave = async () => {
    // 1. Tratamento do Valor (Converte vírgula para ponto e transforma em número)
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      return Alert.alert('Erro', 'Digite um valor numérico válido e maior que zero.');
    }

    // 2. Definição da Categoria Final
    let finalCategory = '';
    if (isCustomCategory) {
      if (!customCategoryText.trim()) return Alert.alert('Erro', 'Digite o nome da sua nova categoria.');
      // Padroniza a primeira letra maiúscula para o banco de dados
      finalCategory = customCategoryText.trim().charAt(0).toUpperCase() + customCategoryText.trim().slice(1);
    } else {
      if (!selectedCategory) return Alert.alert('Erro', 'Selecione uma categoria para a transação.');
      finalCategory = selectedCategory;
    }

    // 3. Tratamento da Descrição (Opcional)
    const finalDescription = description.trim() ? description.trim() : (type === 'receita' ? 'Nova Receita' : 'Nova Despesa');

    setIsLoading(true);

    try {
      let finalReceiptUrl = null;

      // Upload da Imagem (se existir)
      if (receiptImage) {
        const filename = `recibos/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadString(storageRef, receiptImage, 'data_url');
        finalReceiptUrl = await getDownloadURL(storageRef);
      }

      // 4. Salvar no Firestore de forma limpa e estruturada
      await addTransaction({
        description: finalDescription,
        amount: numericAmount,
        type: type,
        category: finalCategory,
      }, finalReceiptUrl || undefined);

      Alert.alert('Sucesso!', 'Transação salva com sucesso.');
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert('Erro', 'Não foi possível salvar a transação no banco de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCategories = type === 'receita' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Transação</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          
          {/* SELETOR: RECEITA OU DESPESA */}
          <View style={styles.typeSelector}>
            <TouchableOpacity style={[styles.typeBtn, type === 'receita' && styles.typeBtnIncome]} onPress={() => handleTypeChange('receita')}>
              <MaterialCommunityIcons name="arrow-up-circle" size={20} color={type === 'receita' ? '#FFF' : '#2E7D32'} />
              <Text style={[styles.typeText, type === 'receita' && { color: '#FFF' }]}>Receita</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.typeBtn, type === 'despesa' && styles.typeBtnExpense]} onPress={() => handleTypeChange('despesa')}>
              <MaterialCommunityIcons name="arrow-down-circle" size={20} color={type === 'despesa' ? '#FFF' : '#C62828'} />
              <Text style={[styles.typeText, type === 'despesa' && { color: '#FFF' }]}>Despesa</Text>
            </TouchableOpacity>
          </View>

          {/* VALOR */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput
              style={[styles.input, { fontSize: 32, fontWeight: 'bold', color: type === 'receita' ? '#2E7D32' : '#C62828' }]}
              placeholder="0,00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* LISTA DE CATEGORIAS (CHIPS) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoriesWrapper}>
              {currentCategories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.categoryChip, selectedCategory === cat && !isCustomCategory && styles.categoryChipSelected]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setIsCustomCategory(false);
                  }}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === cat && !isCustomCategory && { color: '#FFF' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
              
              {/* Botão de Categoria Personalizada */}
              <TouchableOpacity 
                style={[styles.categoryChip, isCustomCategory && styles.categoryChipSelected]}
                onPress={() => setIsCustomCategory(true)}
              >
                <MaterialCommunityIcons name="plus" size={16} color={isCustomCategory ? '#FFF' : '#666'} />
                <Text style={[styles.categoryChipText, isCustomCategory && { color: '#FFF' }]}>Outra</Text>
              </TouchableOpacity>
            </View>

            {/* Campo que aparece se o usuário escolher "Outra" */}
            {isCustomCategory && (
              <TextInput 
                style={[styles.input, { marginTop: 10 }]} 
                placeholder="Qual o nome da categoria?" 
                value={customCategoryText} 
                onChangeText={setCustomCategoryText} 
                autoFocus
              />
            )}
          </View>

          {/* DESCRIÇÃO (OPCIONAL) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição (Opcional)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Almoço de domingo..." 
              value={description} 
              onChangeText={setDescription} 
            />
          </View>

          {/* ANEXO DE RECIBO */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recibo (Opcional)</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              {receiptImage ? (
                <Image source={{ uri: receiptImage }} style={styles.previewImage} />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera-plus" size={32} color="#999" />
                  <Text style={{ color: '#999', marginTop: 8 }}>Anexar foto do comprovante</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* BOTÃO SALVAR */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: type === 'receita' ? '#2E7D32' : '#C62828' }]} onPress={handleSave} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Salvar Transação</Text>}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backBtn: { padding: 5 },
  formContent: { padding: 20, paddingBottom: 40 },
  
  typeSelector: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', gap: 8 },
  typeBtnIncome: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  typeBtnExpense: { backgroundColor: '#C62828', borderColor: '#C62828' },
  typeText: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
  
  // Estilos das Categorias (Chips)
  categoriesWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  categoryChipSelected: { backgroundColor: '#47A138', borderColor: '#47A138' },
  categoryChipText: { fontSize: 14, color: '#475569', fontWeight: '500' },

  imagePickerBtn: { backgroundColor: '#F8F9FA', height: 120, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFF' },
  saveBtn: { padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});