import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';

import Navbar from '../../components/ui/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDashboardViewModel } from '../../viewmodels/useDashboardViewModel';
import { useTransactions } from '../../contexts/TransactionContext';

interface Transaction {
  id: string;
  description: string;
  type: 'receita' | 'despesa';
  amount: number;
  date: any;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const formatCurrency = (val: number) => currencyFormatter.format(val || 0);

const TransactionItem = React.memo(({ transaction, colors }: { transaction: Transaction, colors: any }) => {
  const isIncome = transaction.type === 'receita';
  return (
    <View style={[styles.tiContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.tiIconWrap, { backgroundColor: isIncome ? `${colors.success}18` : `${colors.danger}18` }]}>
        <Ionicons name={isIncome ? 'arrow-down' : 'arrow-up'} size={18} color={isIncome ? colors.success : colors.danger} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.tiDesc, { color: colors.text }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.tiDate, { color: colors.textSecondary }]}>
          {transaction.date instanceof Date ? transaction.date.toLocaleDateString('pt-BR') : 'Hoje'}
        </Text>
      </View>
      <Text style={[styles.tiAmount, { color: isIncome ? colors.success : colors.danger }]}>
        {isIncome ? '+' : '-'} {formatCurrency(Number(transaction.amount || 0))}
      </Text>
    </View>
  );
});

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors: themeColors, theme: currentTheme } = useTheme();
  const { transactions } = useTransactions(); 

  const { financial, quickActions } = useDashboardViewModel(transactions); 

  const [showBalance, setShowBalance] = useState(true);
  const isDark = currentTheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const colors = React.useMemo(
    () => ({
      background: themeColors.background || '#F8FAFC',
      card: themeColors.card || '#FFFFFF',
      text: themeColors.text || '#0F172A',
      textSecondary: themeColors.textSecondary || '#64748B',
      border: themeColors.border || '#E2E8F0',
      accent: themeColors.accent || '#10B981',
      danger: themeColors.danger || '#EF4444',
      success: '#22C55E',
    }),
    [themeColors]
  );

  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  const { incomePercent, expensePercent } = React.useMemo(() => {
    const total = (financial.income || 0) + (financial.expense || 0);
    if (total === 0) return { incomePercent: 0, expensePercent: 0 };
    
    return {
      incomePercent: Math.round((financial.income / total) * 100),
      expensePercent: Math.round((financial.expense / total) * 100),
    };
  }, [financial.income, financial.expense]);

  const extendedActions = React.useMemo(() => {
    const staticMeta = [
      {
        label: 'Metas',
        subtitle: 'Focar',
        icon: 'flag-outline',
        color: '#8B5CF6',
        bg: '#8B5CF616',
        onPress: () => navigation.navigate('Goals'),
      },
      {
        label: 'Relatórios',
        subtitle: 'Análises',
        icon: 'bar-chart-outline',
        color: '#3B82F6',
        bg: '#3B82F616',
        onPress: () => navigation.navigate('ResumoFinanceiro'),
      },
    ];

    const dynamicActions = quickActions.map((action) => {
      const isReceita = action.type === 'receita';

      return {
        label: action.label,
        subtitle: isReceita ? 'Registrar' : 'Gasto',
        icon: isReceita ? 'arrow-down-outline' : 'arrow-up-outline',
        color: isReceita ? colors.success : colors.danger,
        bg: isReceita ? `${colors.success}16` : `${colors.danger}16`,
        onPress: () =>
          navigation.navigate('TransactionForm', { type: action.type }),
      };
    });

    return [...dynamicActions, ...staticMeta];
  }, [quickActions, colors, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <Navbar theme={colors} />

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <FlatList
          data={financial.recent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          renderItem={({ item }) => <TransactionItem transaction={item} colors={colors} />}
          ListHeaderComponent={
            <>
              <View style={styles.navbarSpacer} />
              <View style={styles.contentWrapper}>
                {/* HEADER */}
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Olá, {firstName} 👋
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Panorama financeiro do dia.
              </Text>
            </View>

            {/* BALANÇO */}
            <View
              style={[
                styles.mainCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Saldo total
                  </Text>
                  <Text style={[styles.balanceText, { color: colors.text }]}>
                    {showBalance
                      ? formatCurrency(financial.balance)
                      : 'R$ ••••••'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setShowBalance(!showBalance)}
                  style={[
                    styles.eyeButton,
                    {
                      backgroundColor: isDark
                        ? `${colors.textSecondary}20`
                        : '#F1F5F9',
                    },
                  ]}
                >
                  <Ionicons
                    name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* GRÁFICO CENTRALIZADO */}
            <View style={{ marginVertical: 8 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Análise de Fluxo
              </Text>

              <View
                style={[
                  styles.chartCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.chartWrapper}>
                  <PieChart
                    data={[
                      { value: financial.income || 1, color: colors.success },
                      { value: financial.expense || 1, color: colors.danger },
                    ]}
                    donut
                    radius={70}
                    innerRadius={54}
                    innerCircleColor={colors.card}
                    showText={false}
                    centerLabelComponent={() => (
                      <View style={styles.centerLabel}>
                        <Text style={[styles.centerPercentText, { color: colors.text }]}>
                          {incomePercent}%
                        </Text>
                        <Text style={[styles.centerSubText, { color: colors.textSecondary }]}>
                          ENTRADAS
                        </Text>
                      </View>
                    )}
                  />
                </View>

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={styles.legendHeaderRow}>
                      <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                      <Text style={[styles.legendLabelText, { color: colors.text }]}>
                        Entradas ({incomePercent}%)
                      </Text>
                    </View>
                    <Text style={[styles.legendValueText, { color: colors.success }]}>
                      {formatCurrency(financial.income)}
                    </Text>
                  </View>

                  <View style={styles.legendItem}>
                    <View style={styles.legendHeaderRow}>
                      <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                      <Text style={[styles.legendLabelText, { color: colors.text }]}>
                        Saídas ({expensePercent}%)
                      </Text>
                    </View>
                    <Text style={[styles.legendValueText, { color: colors.danger }]}>
                      {formatCurrency(financial.expense)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* AÇÕES */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ações rápidas
            </Text>

            <View style={styles.quickActionsGrid}>
              {extendedActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickActionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={action.onPress}
                >
                  <View
                    style={[
                      styles.quickActionIconWrap,
                      { backgroundColor: action.bg },
                    ]}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={24}
                      color={action.color}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.quickActionTitle, { color: colors.text }]}
                    >
                      {action.label}
                    </Text>
                    <Text
                      style={[
                        styles.quickActionSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {action.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>
                Lançamentos recentes
              </Text>
            </View>
            </>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbarSpacer: { height: 0 }, // Corrigido de 90 para 0 para remover o buraco vazio do topo
  scrollContent: { padding: 16, paddingBottom: 40 },
  contentWrapper: { width: '100%', maxWidth: 860, alignSelf: 'center' },
  header: { marginBottom: 20, marginTop: 10 },
  greeting: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4 },
  mainCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  balanceText: { fontSize: 32, fontWeight: '900', marginTop: 8 },
  eyeButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },
  chartCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPercentText: {
    fontSize: 22,
    fontWeight: '900',
  },
  centerSubText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendValueText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48.5%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickActionTitle: { fontSize: 13, fontWeight: '800' },
  quickActionSubtitle: { fontSize: 10 },
  tiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  tiIconWrap: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  tiDesc: { fontSize: 15, fontWeight: '700' },
  tiDate: { fontSize: 11 },
  tiAmount: { fontSize: 15, fontWeight: '800' },
});