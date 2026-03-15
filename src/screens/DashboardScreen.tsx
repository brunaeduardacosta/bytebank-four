import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Contextos
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import Navbar from "../components/ui/Navbar";

// --- CONSTANTES ---
const { width: screenWidth } = Dimensions.get("window");
const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

const Themes = {
  light: { bg: "#F8FAFC", card: "#FFFFFF", text: "#1F2937", subText: "#6B7280", border: "#E2E8F0", accent: "#47A138", tab: "#F1F5F9" },
  dark: { bg: "#0F172A", card: "#1E293B", text: "#F8FAFC", subText: "#94A3B8", border: "#334155", accent: "#4ADE80", tab: "#334155" }
};

export default function MobileDashboardScreen({ navigation }: any) {
  // Mantive o estado para o tema, embora o botão tenha sido removido do header
  const [isDarkMode] = useState(false); 
  const [showValue, setShowValue] = useState(true);
  
  const { user } = useAuth();
  const { balance, transactions } = useTransactions();
  
  const theme = isDarkMode ? Themes.dark : Themes.light;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Visitante';

  const totalDespesas = useMemo(() => {
    return transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const metaReserva = 10000;
  const progressoDecimal = balance > 0 ? Math.min(balance / metaReserva, 1) : 0;
  const progressoPorcentagem = (progressoDecimal * 100).toFixed(0);

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: progressoDecimal,
      duration: 1500,
      useNativeDriver: false, 
    }).start();
  }, [progressoDecimal, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      <Navbar theme={theme} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: NAVBAR_HEIGHT + 20 }]}
      >
        
        {/* APENAS O CUMPRIMENTO */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.greeting, { color: theme.text }]}>Olá, {firstName}!</Text>
          <Text style={[styles.subGreeting, { color: theme.subText }]}>Sua vida financeira hoje</Text>
        </View>

        {/* CARD DE SALDO TOTAL */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ResumoFinanceiro')}
          style={[styles.balanceCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.rowBetween}>
            <Text style={[styles.balanceLabel, { color: theme.subText }]}>Saldo total disponível</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowValue(!showValue)} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} style={{ marginRight: 15 }}>
                <Ionicons name={showValue ? "eye-outline" : "eye-off-outline"} size={22} color={theme.subText} />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={theme.accent} />
            </View>
          </View>
          <Text style={[styles.balanceValue, { color: theme.text }]}>{showValue ? formatCurrency(balance) : "••••••"}</Text>
          <View style={{ marginTop: 8 }}>
             <Text style={[styles.smallText, { color: theme.accent, fontWeight: '700' }]}>Ver resumo detalhado</Text>
          </View>
        </TouchableOpacity>

        {/* RESERVA DE EMERGÊNCIA */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Reserva de Emergência</Text>
            <Text style={[styles.percentageText, { color: theme.accent }]}>{progressoPorcentagem}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? "#334155" : "#E2E8F0" }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: theme.accent, width: progressWidth }]} />
          </View>
          <View style={styles.rowBetween}>
            <Text style={[styles.smallText, { color: theme.subText }]}>{formatCurrency(balance > 0 ? balance : 0)}</Text>
            <Text style={[styles.smallText, { color: theme.subText }]}>Alvo: {formatCurrency(metaReserva)}</Text>
          </View>
        </View>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <View style={styles.quickActionsContainer}>
          <QuickAction icon="swap-horizontal-outline" label="Pix" theme={theme} onPress={() => navigation.navigate('Transferencia')} />
          <QuickAction icon="receipt-outline" label="Extrato" theme={theme} onPress={() => navigation.navigate('Statement')} />
          <QuickAction icon="cash-outline" label="Empréstimo" theme={theme} onPress={() => navigation.navigate('Emprestimo')} />
          <QuickAction icon="rocket-outline" label="Investir" theme={theme} onPress={() => {}} />
          <QuickAction icon="shield-checkmark-outline" label="Seguros" theme={theme} onPress={() => {}} />
        </View>

        {/* GASTOS TOTAIS */}
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} activeOpacity={0.9}>
          <View style={styles.rowBetween}>
             <Text style={[styles.cardTitle, { color: theme.text }]}>Total de Despesas</Text>
             <Ionicons name="trending-down-outline" size={20} color="#EF4444" />
          </View>
          <View style={[styles.rowBetween, { marginTop: 15 }]}>
            <View>
              <Text style={[styles.smallText, { color: theme.subText }]}>Saídas registradas</Text>
              <Text style={[styles.bigValue, { color: theme.text }]}>{formatCurrency(totalDespesas)}</Text>
            </View>
            <TouchableOpacity style={[styles.payBtn, { backgroundColor: theme.accent }]} onPress={() => navigation.navigate('TransactionForm')}>
              <Text style={styles.payBtnText}>Nova</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, theme, onPress }: any) {
  return (
    <View style={styles.actionItem}>
      <TouchableOpacity style={[styles.iconCircle, { backgroundColor: theme.tab }]} activeOpacity={0.6} onPress={onPress}>
        <Ionicons name={icon} size={24} color={theme.accent} />
      </TouchableOpacity>
      <Text style={[styles.actionText, { color: theme.text }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  // ESTILO SIMPLIFICADO PARA O TEXTO
  welcomeSection: { paddingHorizontal: 25, marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  subGreeting: { fontSize: 14, marginTop: 2, opacity: 0.8 },
  
  balanceCard: { marginHorizontal: 20, padding: 25, borderRadius: 30, marginBottom: 20, borderWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: 14, fontWeight: '600' },
  balanceValue: { fontSize: 34, fontWeight: "900", marginTop: 8, letterSpacing: -0.5 },
  card: { marginHorizontal: 20, padding: 22, borderRadius: 24, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontWeight: "700", fontSize: 16 },
  progressTrack: { height: 10, borderRadius: 5, marginVertical: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  percentageText: { fontWeight: 'bold', fontSize: 14 },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, marginBottom: 10 },
  actionItem: { alignItems: 'center', width: (screenWidth - 30) / 5.2 },
  iconCircle: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  smallText: { fontSize: 12, fontWeight: '500' },
  bigValue: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  payBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  payBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});