import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../context/GoalsContext';

export default function GoalFormScreen({ navigation }: any) {
  const { addGoal } = useGoals();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  // Sugestões rápidas para o utilizador
  const suggestions = [
    'Reserva de Emergência',
    'Viagem',
    'Novo Celular',
    'Presentes de Aniversário',
    'Estoque do Armarinho',
    'Carro Novo'
  ];

  // Paleta de cores premium para sortear na nova meta
  const colors = ['#47A138', '#2563EB', '#8B5CF6', '#F59E0B', '#E11D48', '#0D9488'];

  const handleSave = () => {
    if (!title.trim() || !amount) {
      alert('Por favor, preencha o nome e o valor da meta.');
      return;
    }

    const numericAmount = parseFloat(amount.replace(/\D/g, '')) / 100;

    if (numericAmount <= 0) {
      alert('O valor da meta deve ser maior que zero.');
      return;
    }

    // Sorteia uma cor aleatória para a caixinha
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addGoal({
      title: title.trim(),
      targetAmount: numericAmount,
      currentAmount: 0, // Caixinha começa zerada
      color: randomColor
    });

    navigation.goBack();
  };

  // Máscara simples de dinheiro para o input
  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    const floatValue = parseFloat(numericValue) / 100;
    if (!isNaN(floatValue)) {
      setAmount(floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    } else {
      setAmount('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Caixinha</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="cube-outline" size={48} color="#47A138" />
            </View>
            <Text style={styles.pageSubtitle}>Dê um nome e um alvo para o seu novo objetivo financeiro.</Text>
          </View>

          {/* CAMPO: NOME DA META */}
          <Text style={styles.label}>Para que está a guardar dinheiro?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Viagem para a praia"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            maxLength={30}
          />

          {/* SUGESTÕES (CHIPS) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.chip, title === item && styles.chipActive]}
                onPress={() => setTitle(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, title === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* CAMPO: VALOR ALVO */}
          <Text style={[styles.label, { marginTop: 30 }]}>Qual é a sua meta de valor?</Text>
          <TextInput
            style={styles.inputMoney}
            placeholder="R$ 0,00"
            placeholderTextColor="#94A3B8"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />

        </ScrollView>

        {/* BOTÃO SALVAR */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Criar Caixinha</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  
  content: { padding: 25 },
  
  iconContainer: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  pageSubtitle: { textAlign: 'center', fontSize: 15, color: '#6B7280', lineHeight: 22, paddingHorizontal: 20 },

  label: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
  input: { 
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', 
    borderRadius: 16, padding: 18, fontSize: 16, color: '#1F2937' 
  },
  
  suggestionsContainer: { flexDirection: 'row', marginTop: 15, paddingBottom: 5 },
  chip: { 
    backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'transparent'
  },
  chipActive: { backgroundColor: '#DCFCE7', borderColor: '#47A138' },
  chipText: { color: '#6B7280', fontWeight: '500', fontSize: 14 },
  chipTextActive: { color: '#166534', fontWeight: 'bold' },

  inputMoney: { 
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', 
    borderRadius: 16, padding: 20, fontSize: 28, fontWeight: 'bold', color: '#47A138', textAlign: 'center' 
  },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#FFF' },
  saveBtn: { backgroundColor: '#47A138', padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});