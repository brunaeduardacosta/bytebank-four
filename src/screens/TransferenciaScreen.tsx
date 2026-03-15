import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, Platform, Dimensions,
  KeyboardAvoidingView, Alert, ActivityIndicator
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Navbar from '../components/ui/Navbar';

// IMPORTAÇÃO DO CONTEXTO DE TRANSAÇÕES
import { useTransactions } from '../context/TransactionContext';

const { width } = Dimensions.get('window');

const Themes = {
  light: {
    bg: "#F8FAFC", card: "#FFFFFF", text: "#1F2937", subText: "#6B7280",
    border: "#E2E8F0", accent: "#47A138", tab: "#F1F5F9", danger: "#EF4444",
    avatarBg: "#E2E8F0", avatarText: "#6B7280"
  }
};

export default function TransferenciaScreen({ navigation }: any) {
  const theme = Themes.light;

  // CONEXÃO COM O FIREBASE
  const { balance: saldoDisponivel, addTransaction } = useTransactions();

  // Estados
  const [valor, setValor] = useState(''); // Armazena centavos
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [tipoTransferencia, setTipoTransferencia] = useState<'pix' | 'ted'>('pix');
  const [chavePix, setChavePix] = useState('');
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [cpfDestino, setCpfDestino] = useState('');

  // Formatação de Moeda em Tempo Real
  const handleValorChange = (text: string) => {
    const cleanValue = text.replace(/\D/g, "");
    setValor(cleanValue);
  };

  const valorExibido = useMemo(() => {
    if (!valor) return "0,00";
    const numeric = parseInt(valor) / 100;
    return numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }, [valor]);

  const valorNumerico = useMemo(() => {
    return parseInt(valor || "0") / 100;
  }, [valor]);

  const isOverBalance = valorNumerico > saldoDisponivel;

  const canContinue = useMemo(() => {
    if (isOverBalance || valorNumerico <= 0) return false;
    if (tipoTransferencia === 'pix') return chavePix.length > 3;
    return banco.length > 2 && conta.length > 2;
  }, [isOverBalance, valorNumerico, tipoTransferencia, chavePix, banco, conta]);

  const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

  const contatosFavoritos = [
    { name: "Arthur", initial: "AR" },
    { name: "Bruna", initial: "BS" },
    { name: "Carlos", initial: "CM" },
    { name: "Dani", initial: "DL" },
    { name: "Edu", initial: "EM" }
  ];

  const resetForm = () => {
    setValor('');
    setChavePix('');
    setBanco('');
    setAgencia('');
    setConta('');
    setCpfDestino('');
  };

  const pastePixKey = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setChavePix(text);
  };

  // FUNÇÃO DE TRANSFERÊNCIA REAL NO FIREBASE
  const handleTransfer = () => {
    Alert.alert(
      "Confirmar Transferência",
      `Deseja enviar R$ ${valorExibido}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setLoadingTransfer(true);
            try {
              // Define o título da transação com base no tipo escolhido
              const descricao = tipoTransferencia === 'pix' 
                ? `Transferência PIX - ${chavePix}`
                : `Transferência TED - Banco ${banco}`;

              // Salva a transferência como despesa no Firebase
              await addTransaction({
                description: descricao,
                amount: valorNumerico,
                type: 'despesa',
                category: 'Transferência'
              });

              Alert.alert("Sucesso", "Transferência realizada com sucesso!");
              resetForm();
              navigation.goBack(); // Volta para o Dashboard
            } catch (err) {
              Alert.alert("Erro", "Não foi possível completar a transação.");
              console.error(err);
            } finally {
              setLoadingTransfer(false);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <Navbar theme={theme} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: NAVBAR_HEIGHT + 10 }]}
      >
        {/* HEADER */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Área de Transferência</Text>
          <Ionicons name="help-circle-outline" size={24} color={theme.subText} />
        </View>

        {/* CARD DE VALOR */}
        <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: isOverBalance ? theme.danger : theme.border }]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: theme.subText, fontWeight: '700' }]}>VALOR PARA ENVIAR</Text>
            <TouchableOpacity onPress={() => setValor((saldoDisponivel * 100).toFixed(0))}>
              <Text style={{ color: theme.accent, fontSize: 12, fontWeight: '800' }}>USAR TUDO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountInputRow}>
            <Text style={[styles.currencySymbol, { color: theme.text }]}>R$</Text>
            <TextInput
              style={[styles.hugeInput, { color: isOverBalance ? theme.danger : theme.text }]}
              placeholder="0,00"
              keyboardType="numeric"
              value={valorExibido === "0,00" ? "" : valorExibido}
              onChangeText={handleValorChange}
              placeholderTextColor={theme.subText + '50'}
            />
          </View>

          <View style={styles.balanceFooter}>
            <Text style={[styles.balanceText, { color: theme.subText }]}>
              Saldo disponível: <Text style={{fontWeight: '700', color: theme.text}}>R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </Text>
            {isOverBalance && (
              <Text style={{ color: theme.danger, fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                Valor acima do saldo disponível
              </Text>
            )}
          </View>
        </View>

        {/* SELETOR PIX/TED */}
        <View style={[styles.tabBar, { backgroundColor: theme.tab }]}>
          {(['pix', 'ted'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.tabItem, tipoTransferencia === mode && { backgroundColor: theme.card, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 }]}
              onPress={() => setTipoTransferencia(mode)}
            >
              <Text style={{ color: tipoTransferencia === mode ? theme.text : theme.subText, fontWeight: '800', textTransform: 'uppercase', fontSize: 13 }}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FORMULÁRIOS */}
        <View style={[styles.formContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
          {tipoTransferencia === 'pix' ? (
            <View>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Identificação da conta</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.tab, color: theme.text }]}
                  placeholder="CPF, E-mail ou Telefone"
                  value={chavePix}
                  onChangeText={setChavePix}
                  placeholderTextColor={theme.subText}
                />
                <TouchableOpacity style={styles.pasteBtn} onPress={pastePixKey}>
                  <Ionicons name="clipboard-outline" size={22} color={theme.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Dados Bancários</Text>
              <TextInput style={[styles.inputField, { backgroundColor: theme.tab }]} placeholder="Nome do Banco" value={banco} onChangeText={setBanco} />
              <View style={{flexDirection: 'row', gap: 10}}>
                <TextInput style={[styles.inputField, { backgroundColor: theme.tab, flex: 1 }]} placeholder="Agência" value={agencia} onChangeText={setAgencia} keyboardType="numeric" />
                <TextInput style={[styles.inputField, { backgroundColor: theme.tab, flex: 2 }]} placeholder="Conta com dígito" value={conta} onChangeText={setConta} keyboardType="numeric" />
              </View>
              <TextInput style={[styles.inputField, { backgroundColor: theme.tab }]} placeholder="CPF do favorecido" value={cpfDestino} onChangeText={setCpfDestino} keyboardType="numeric" />
              <Text style={{ fontSize: 11, color: theme.subText, fontStyle: 'italic', marginTop: 5 }}>Taxa de conveniência: R$ 3,50</Text>
            </View>
          )}
        </View>

        {/* FAVORITOS */}
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recentes</Text>
            <TouchableOpacity><Text style={{color: theme.accent, fontSize: 12, fontWeight: '700'}}>VER TODOS</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 30}}>
          {contatosFavoritos.map((c, i) => (
            <ContactItem key={i} name={c.name} initial={c.initial} theme={theme} />
          ))}
        </ScrollView>

        {/* BOTÃO FINAL */}
        <TouchableOpacity
          style={[styles.mainActionBtn, { backgroundColor: theme.accent, opacity: canContinue ? 1 : 0.4 }]}
          disabled={!canContinue || loadingTransfer}
          onPress={handleTransfer}
          activeOpacity={0.8}
        >
          {loadingTransfer ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.mainActionBtnText}>Revisar Transferência</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ContactItem({ name, initial, theme }: any) {
  return (
    <TouchableOpacity style={styles.contactContainer} activeOpacity={0.7}>
      <View style={[styles.contactAvatar, { backgroundColor: theme.avatarBg }]}>
        <Text style={{ color: theme.avatarText, fontWeight: 'bold', fontSize: 16 }}>{initial}</Text>
      </View>
      <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: '900' },
  mainCard: { padding: 20, borderRadius: 24, borderWidth: 1.5, marginBottom: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, letterSpacing: 0.5 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  currencySymbol: { fontSize: 28, fontWeight: '900', marginRight: 10 },
  hugeInput: { fontSize: 42, fontWeight: '900', flex: 1, padding: 0 },
  balanceFooter: { borderTopWidth: 1, borderTopColor: '#00000008', paddingTop: 12 },
  balanceText: { fontSize: 13 },
  tabBar: { flexDirection: 'row', padding: 5, borderRadius: 16, marginBottom: 20 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  formContainer: { padding: 20, borderRadius: 24, marginBottom: 25 },
  inputLabel: { fontSize: 14, fontWeight: '800', marginBottom: 15 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputField: { flex: 1, padding: 16, borderRadius: 16, marginBottom: 12, fontSize: 15, fontWeight: '600' },
  pasteBtn: { padding: 10, borderRadius: 12, backgroundColor: '#00000005' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  contactContainer: { alignItems: 'center', marginRight: 20 },
  contactAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  mainActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20 },
  mainActionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, marginRight: 10 }
});