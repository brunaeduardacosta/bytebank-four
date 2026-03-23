import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function OnboardingScreen({ navigation }: any) {
  const { user } = useAuth();
  const { addTransaction } = useTransactions();

  const [ocupacao, setOcupacao] = useState('');
  const [renda, setRenda] = useState('');
  const [saldo, setSaldo] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Usuário';

  // Lista profissional (ordenada)
  const sugestoesOcupacaoBase = [
    'Administrador', 'Advogado', 'Analista de Sistemas', 'Arquiteto',
    'Atendente', 'Autônomo', 'CLT', 'Desenvolvedor', 'Designer',
    'Empreendedor', 'Enfermeiro', 'Engenheiro', 'Estudante',
    'Freelancer', 'Gerente', 'Médico', 'Motorista de App',
    'Professor', 'Psicólogo', 'Servidor Público', 'Técnico', 'Vendedor'
  ];

  const sugestoesOrdenadas = [...sugestoesOcupacaoBase].sort();

  // Se o campo estiver vazio, retorna tudo. Se tiver texto, filtra.
  const sugestoesFiltradas = sugestoesOrdenadas.filter(item =>
    item.toLowerCase().includes(ocupacao.toLowerCase())
  );

  const opcoesObjetivos = [
    'Sair das dívidas',
    'Controlar meus gastos',
    'Criar uma reserva',
    'Começar a investir'
  ];

  const handleMoneyChange = (text: string, setter: any) => {
    const numericValue = text.replace(/\D/g, '');
    const floatValue = parseFloat(numericValue) / 100;

    if (!isNaN(floatValue)) {
      setter(
        floatValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      );
    } else {
      setter('');
    }
  };

  const handleFinish = async () => {
    if (!user) return;

    if (!ocupacao) {
      alert('Por favor, informe sua ocupação.');
      return;
    }

    try {
      const saldoNumerico = parseFloat(saldo.replace(/\D/g, '')) / 100 || 0;
      const rendaNumerica = parseFloat(renda.replace(/\D/g, '')) / 100 || 0;

      const userRef = doc(db, 'users', user.uid);

      await setDoc(
        userRef,
        {
          ocupacao: ocupacao,
          rendaMensal: rendaNumerica,
          objetivoPrincipal: objetivo || 'Não informado',
          onboardingCompleted: true,
          atualizadoEm: new Date()
        },
        { merge: true }
      );

      if (saldoNumerico > 0) {
        addTransaction({
          description: 'Saldo Inicial',
          amount: saldoNumerico,
          type: 'receita',
          category: 'Ajuste'
        });
      }

      navigation.replace('Dashboard');
    } catch (error) {
      console.error('Erro ao guardar os dados: ', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          onboardingCompleted: true,
          atualizadoEm: new Date()
        },
        { merge: true }
      );

      navigation.replace('Dashboard');
    } catch {
      navigation.replace('Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ width: 60 }} />
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Pular</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

       <ScrollView
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.content}
         keyboardShouldPersistTaps="handled"
       >
          {/* TOPO */}
          <View style={styles.welcomeHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="hand-wave" size={36} color="#47A138" />
            </View>

            <Text style={styles.title}>Olá, {firstName}!</Text>

            <Text style={styles.highlightSubtitle}>
              Vamos configurar sua experiência financeira de forma inteligente.
            </Text>

            <Text style={styles.mainEmphasis}>
              Leva menos de 1 minuto.
            </Text>
          </View>

          {/* OCUPAÇÃO */}
          <Text style={styles.label}>1. Qual é a sua principal ocupação?</Text>
          <Text style={styles.helperText}>
            Isso nos ajuda a personalizar sua experiência.
          </Text>
          <View style={{ position: 'relative', zIndex: 999 }}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Desenvolvedor, Advogado..."
              placeholderTextColor="#94A3B8"
              value={ocupacao}
              onChangeText={(text) => {
                  setOcupacao(text);
                  setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)} 
            />
            
            {showDropdown && sugestoesFiltradas.length > 0 && (
              <View style={styles.dropdown}>
                {/* always garante que o clique registre instantaneamente */}
                <ScrollView keyboardShouldPersistTaps="always"> 
                  {sugestoesFiltradas.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPressIn={() => { 
                        setOcupacao(item);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* RENDA */}
          <Text style={styles.label}>2. Qual é sua renda mensal?</Text>
          <Text style={styles.helperText}>
            Usamos isso para sugerir limites saudáveis.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="R$ 0,00"
            value={renda}
            onChangeText={(t) => handleMoneyChange(t, setRenda)}
            keyboardType="numeric"
            // Se clicar na renda, garante que o dropdown da ocupação fecha
            onFocus={() => setShowDropdown(false)} 
          />

          {/* SALDO */}
          <Text style={styles.label}>3. Quanto você tem disponível hoje?</Text>
          <Text style={styles.helperText}>
            Pode ser o valor atual da sua conta.
          </Text>

          <TextInput
            style={[styles.input, { color: '#47A138', fontWeight: 'bold' }]}
            placeholder="R$ 0,00"
            value={saldo}
            onChangeText={(t) => handleMoneyChange(t, setSaldo)}
            keyboardType="numeric"
            // Se clicar no saldo, garante que o dropdown da ocupação fecha
            onFocus={() => setShowDropdown(false)} 
          />

          {/* OBJETIVO */}
          <Text style={styles.label}>4. Qual seu principal objetivo?</Text>

          <View style={styles.chipsContainerWrap}>
            {opcoesObjetivos.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.chipWrap,
                  objetivo === item && styles.chipActive
                ]}
                onPress={() => {
                  setObjetivo(item);
                  setShowDropdown(false); // Fecha o dropdown se clicar nos chips também
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    objetivo === item && styles.chipTextActive
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleFinish}>
            <Text style={styles.saveBtnText}>Começar minha jornada</Text>
            <Ionicons name="rocket-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  skipBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  skipText: { color: '#6B7280', fontWeight: '600' },
  content: { paddingHorizontal: 25, paddingBottom: 60, zIndex: 0 },
  welcomeHeader: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900' },
  highlightSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  mainEmphasis: { fontSize: 18, fontWeight: 'bold', color: '#16A34A', marginTop: 5 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15 },
  helperText: { fontSize: 13, color: '#94A3B8', marginBottom: 10 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, marginBottom: 20 },
  
  dropdown: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 1000,
    elevation: 10,
    maxHeight: 180, // Mantém o tamanho da caixa limitado, forçando a rolagem
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownText: { fontSize: 15 },
  
  chipsContainerWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chipWrap: { padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10, marginBottom: 10 },
  chipActive: { backgroundColor: '#DCFCE7', borderColor: '#47A138' },
  chipText: { color: '#6B7280' },
  chipTextActive: { color: '#166534', fontWeight: 'bold' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  saveBtn: { backgroundColor: '#47A138', padding: 18, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' }
});