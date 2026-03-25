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
  ScrollView,
  Alert
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // 🔥 Importação do Tema

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function OnboardingScreen({ navigation }: any) {
  const { user } = useAuth();
  const { addTransaction } = useTransactions();
  const { colors, theme } = useTheme(); // 🔥 Consumindo as cores dinâmicas

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

    if (!ocupacao.trim()) {
      Alert.alert('Atenção', 'Por favor, informe sua ocupação.');
      return;
    }

    try {
      const saldoNumerico = parseFloat(saldo.replace(/\D/g, '')) / 100 || 0;
      const rendaNumerica = parseFloat(renda.replace(/\D/g, '')) / 100 || 0;

      // 1. SALVA NO FIRESTORE (A parte mais importante!)
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          ocupacao: ocupacao.trim(),
          rendaMensal: rendaNumerica,
          objetivoPrincipal: objetivo || 'Não informado',
          onboardingCompleted: true, // ✅ A Flag Mágica!
          atualizadoEm: new Date()
        },
        { merge: true }
      );

      // 2. TENTA ADICIONAR O SALDO (Isolado para não quebrar o fluxo se falhar)
      if (saldoNumerico > 0) {
        try {
          await addTransaction({
            description: 'Saldo Inicial',
            amount: saldoNumerico,
            type: 'receita',
            category: 'Ajuste',
          });
        } catch (e) {
          console.log('Aviso: Falha ao registrar saldo inicial, mas o onboarding continuou.', e);
        }
      }

      // 3. LIMPA A PILHA DE NAVEGAÇÃO E VAI PRA DASHBOARD
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });

    } catch (error) {
      console.error('Erro ao guardar os dados: ', error);
      Alert.alert('Erro', 'Não foi possível salvar. Verifique sua internet.');
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          onboardingCompleted: true, // ✅ Salva a flag mesmo se pular
          atualizadoEm: new Date()
        },
        { merge: true }
      );

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch {
      // Falha de segurança, força a ida de qualquer jeito
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ width: 60 }} />
          <TouchableOpacity onPress={handleSkip} style={[styles.skipBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Pular</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* TOPO */}
          <View style={styles.welcomeHeader}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.accent}15` }]}>
              <MaterialCommunityIcons name="hand-wave" size={36} color={colors.accent} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Olá, {firstName}!</Text>

            <Text style={[styles.highlightSubtitle, { color: colors.textSecondary }]}>
              Vamos configurar sua experiência financeira de forma inteligente.
            </Text>

            <Text style={[styles.mainEmphasis, { color: colors.accent }]}>
              Leva menos de 1 minuto.
            </Text>
          </View>

          {/* OCUPAÇÃO */}
          <Text style={[styles.label, { color: colors.text }]}>1. Qual é a sua principal ocupação?</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Isso nos ajuda a personalizar sua experiência.
          </Text>
          <View style={{ position: 'relative', zIndex: 999 }}>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
              ]}
              placeholder="Ex: Desenvolvedor, Advogado..."
              placeholderTextColor={colors.textSecondary}
              value={ocupacao}
              onChangeText={(text) => {
                  setOcupacao(text);
                  setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)} 
            />
            
            {showDropdown && sugestoesFiltradas.length > 0 && (
              <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ScrollView keyboardShouldPersistTaps="always"> 
                  {sugestoesFiltradas.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      onPressIn={() => { 
                        setOcupacao(item);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownText, { color: colors.text }]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* RENDA */}
          <Text style={[styles.label, { color: colors.text }]}>2. Qual é sua renda mensal?</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Usamos isso para sugerir limites saudáveis.
          </Text>

          <TextInput
            style={[
              styles.input, 
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
            ]}
            placeholder="R$ 0,00"
            placeholderTextColor={colors.textSecondary}
            value={renda}
            onChangeText={(t) => handleMoneyChange(t, setRenda)}
            keyboardType="numeric"
            onFocus={() => setShowDropdown(false)} 
          />

          {/* SALDO */}
          <Text style={[styles.label, { color: colors.text }]}>3. Quanto você tem disponível hoje?</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Pode ser o valor atual da sua conta.
          </Text>

         <TextInput
            style={[
              styles.input, 
              { backgroundColor: colors.card, borderColor: colors.border, color: '#10B981', fontWeight: 'bold' }
            ]}
            placeholder="R$ 0,00"
            placeholderTextColor={colors.textSecondary}
            value={saldo}
            onChangeText={(t) => handleMoneyChange(t, setSaldo)}
            keyboardType="numeric"
            onFocus={() => setShowDropdown(false)} 
          />

          {/* OBJETIVO */}
          <Text style={[styles.label, { color: colors.text }]}>4. Qual seu principal objetivo?</Text>

          <View style={styles.chipsContainerWrap}>
            {opcoesObjetivos.map((item, index) => {
              const isActive = objetivo === item;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chipWrap,
                    { 
                      backgroundColor: isActive ? `${colors.accent}15` : colors.card,
                      borderColor: isActive ? colors.accent : colors.border
                    }
                  ]}
                  onPress={() => {
                    setObjetivo(item);
                    setShowDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isActive ? colors.accent : colors.textSecondary, fontWeight: isActive ? 'bold' : 'normal' }
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.accent }]} 
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Começar minha jornada</Text>
            <Ionicons name="rocket-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS ESTRUTURAIS ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  skipBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  skipText: { fontWeight: '600', marginRight: 4 },
  
  content: { paddingHorizontal: 25, paddingBottom: 60, zIndex: 0 },
  
  welcomeHeader: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900' },
  highlightSubtitle: { fontSize: 15, textAlign: 'center', marginTop: 8 },
  mainEmphasis: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15 },
  helperText: { fontSize: 13, marginBottom: 10 },
  
  input: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20, fontSize: 16 },
  
  dropdown: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 10,
    maxHeight: 180,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1 },
  dropdownText: { fontSize: 15 },
  
  chipsContainerWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  chipWrap: { padding: 12, borderRadius: 20, borderWidth: 1, marginRight: 10, marginBottom: 10 },
  chipText: { fontSize: 14 },
  
  footer: { padding: 20, borderTopWidth: 1 },
  saveBtn: { padding: 18, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});