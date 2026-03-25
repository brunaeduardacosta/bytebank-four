import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Animated,
  Dimensions,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts'; 
import Navbar from '../components/ui/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { transactions = [] } = useTransactions?.() || {};
  const { colors: themeColors, theme: currentTheme } = useTheme(); 
  
  const [showBalance, setShowBalance] = useState(true);
  const isDark = currentTheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const colors = useMemo(() => ({
    background: themeColors.background || '#F8FAFC',
    card: themeColors.card || '#FFFFFF',
    text: themeColors.text || '#0F172A',
    textSecondary: themeColors.textSecondary || '#64748B',
    border: themeColors.border || '#E2E8F0',
    accent: themeColors.accent || '#10B981',
    danger: themeColors.danger || '#EF4444',
    success: '#22C55E',
  }), [themeColors]);

  const firstName = user?.displayName?.split(' ')[0] || 'Usuário';

  const financialData = useMemo(() => {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const income = safeTransactions
      .filter((t: any) => t?.type === 'receita' || t?.type === 'income')
      .reduce((sum, t) => sum + Number(t?.amount || 0), 0);
    const expense = safeTransactions
      .filter((t: any) => t?.type === 'despesa' || t?.type === 'expense')
      .reduce((sum, t) => sum + Number(t?.amount || 0), 0);
    const balance = income - expense;

    return {
      income, 
      expense, 
      balance,
      recent: [...safeTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    };
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const quickActions = [
    { label: 'Nova receita', subtitle: 'Registrar', icon: 'arrow-down-outline', color: colors.success, bg: `${colors.success}16`, onPress: () => navigation.navigate('TransactionForm', { type: 'receita' }) },
    { label: 'Nova despesa', subtitle: 'Gasto', icon: 'arrow-up-outline', color: colors.danger, bg: `${colors.danger}16`, onPress: () => navigation.navigate('TransactionForm', { type: 'despesa' }) },
    { label: 'Metas', subtitle: 'Focar', icon: 'flag-outline', color: '#8B5CF6', bg: '#8B5CF616', onPress: () => navigation.navigate('Goals') },
    { label: 'Relatórios', subtitle: 'Análises', icon: 'bar-chart-outline', color: '#3B82F6', bg: '#3B82F616', onPress: () => navigation.navigate('ResumoFinanceiro') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Navbar theme={colors} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentWrapper}>
            
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.text }]}>Olá, {firstName} 👋</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Panorama financeiro do dia.</Text>
            </View>

            {/* Card Saldo Principal */}
            <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Saldo total</Text>
                  <Text style={[styles.balanceText, { color: colors.text }]}>
                    {showBalance ? formatCurrency(financialData.balance) : 'R$ ••••••'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowBalance(!showBalance)} 
                  style={[styles.eyeButton, { backgroundColor: isDark ? `${colors.textSecondary}20` : '#F1F5F9' }]}
                >
                  <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Seção: Análise de Fluxo (UX Melhorada) */}
            <View style={{ marginVertical: 8 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Análise de Fluxo</Text>
              <View style={[styles.chartCard, { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center'
              }]}>
                
                <View style={{ paddingVertical: 10 }}>
                  <PieChart
  data={[
    { value: financialData.income || 1, color: colors.success },
    { value: financialData.expense || 1, color: colors.danger },
  ]}
                    donut
                    radius={65}
                    innerRadius={50}
                    innerCircleColor={colors.card}
                    centerLabelComponent={() => {
                      const total = (financialData.income + financialData.expense) || 1;
                      const percent = Math.round((financialData.income / total) * 100);
                      return (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>{percent}%</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 8, fontWeight: '800' }}>ENTRADA</Text>
                        </View>
                      );
                    }}
                  />
                </View>

                <View style={{ gap: 16 }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 6 }} />
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Entradas</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 14 }}>
                      {formatCurrency(financialData.income)}
                    </Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, marginRight: 6 }} />
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>Saídas</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 14 }}>
                      {formatCurrency(financialData.expense)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Card Conectar Bancos */}
            <TouchableOpacity style={[styles.connectCard, { backgroundColor: colors.accent }]}>
              <View style={styles.connectIconBg}>
                <Ionicons name="link" size={22} color={colors.accent} />
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.connectTitle}>Conectar bancos</Text>
                <Text style={styles.connectSubtitle}>Sincronização automática</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações rápidas</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity key={index} style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={action.onPress}>
                  <View style={[styles.quickActionIconWrap, { backgroundColor: action.bg }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.quickActionTitle, { color: colors.text }]}>{action.label}</Text>
                    <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>{action.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lançamentos recentes</Text>
            {financialData.recent.map((transaction: any, index: number) => {
              const isIncome = transaction.type === 'receita' || transaction.type === 'income';
              return (
                <View key={index} style={[styles.tiContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.tiIconWrap, { backgroundColor: isIncome ? `${colors.success}18` : `${colors.danger}18` }]}>
                    <Ionicons name={isIncome ? 'arrow-down' : 'arrow-up'} size={18} color={isIncome ? colors.success : colors.danger} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.tiDesc, { color: colors.text }]} numberOfLines={1}>{transaction.description}</Text>
                    <Text style={[styles.tiDate, { color: colors.textSecondary }]}>{new Date(transaction.date).toLocaleDateString('pt-BR')}</Text>
                  </View>
                  <Text style={[styles.tiAmount, { color: isIncome ? colors.success : colors.danger }]}>
                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  contentWrapper: { width: '100%', maxWidth: 860, alignSelf: 'center' },
  header: { marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4 },
  mainCard: { borderRadius: 24, padding: 22, borderWidth: 1, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceText: { fontSize: 32, fontWeight: '900', marginTop: 8 },
  eyeButton: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  chartCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 20 },
  connectCard: { borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  connectIconBg: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  connectTitle: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  connectSubtitle: { color: '#FFF', opacity: 0.8, fontSize: 12 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quickActionCard: { width: '48.5%', borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', minHeight: 85 },
  quickActionIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  quickActionTitle: { fontSize: 13, fontWeight: '800' },
  quickActionSubtitle: { fontSize: 10 },
  tiContainer: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  tiIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tiDesc: { fontSize: 15, fontWeight: '700' },
  tiDate: { fontSize: 11 },
  tiAmount: { fontSize: 15, fontWeight: '800' }
});