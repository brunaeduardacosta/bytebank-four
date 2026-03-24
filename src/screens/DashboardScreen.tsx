import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Navbar from '../components/ui/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';

export default function DashboardScreen({ navigation, theme = {} }: any) {
  const { user } = useAuth();
  const { transactions = [] } = useTransactions?.() || {};
  const [showBalance, setShowBalance] = useState(true);

  const colors = useMemo(
    () => ({
      background: theme.background || '#0B1220',
      card: theme.card || '#111827',
      text: theme.text || '#F9FAFB',
      textSecondary: theme.text ? `${theme.text}B3` : '#9CA3AF',
      border: theme.border || '#1F2937',
      accent: theme.accent || '#10B981',
      danger: theme.danger || '#EF4444',
      success: '#22C55E',
      warning: '#F59E0B',
      incomeBg: '#052E1A',
      expenseBg: '#3B0A0A',
      infoBg: '#0F172A',
    }),
    [theme]
  );

  const firstName = user?.displayName?.split(' ')[0] || 'Bruna';

  const financialData = useMemo(() => {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    const income = safeTransactions
      .filter((t: any) => t?.type === 'income')
      .reduce((sum: number, t: any) => sum + Number(t?.amount || 0), 0);

    const expense = safeTransactions
      .filter((t: any) => t?.type === 'expense')
      .reduce((sum: number, t: any) => sum + Number(t?.amount || 0), 0);

    const balance = income - expense;

    const recentTransactions = [...safeTransactions]
      .sort((a: any, b: any) => {
        const dateA = new Date(a?.date || 0).getTime();
        const dateB = new Date(b?.date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      income,
      expense,
      balance,
      recentTransactions,
    };
  }, [transactions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);

  const savingsGoal = {
    current: 3250,
    target: 8000,
  };

  const goalProgress = Math.min(
    (savingsGoal.current / savingsGoal.target) * 100,
    100
  );

  const quickActions = [
    {
      label: 'Nova receita',
      subtitle: 'Registrar entrada',
      icon: 'arrow-down-outline',
      color: colors.success,
      bg: `${colors.success}16`,
      onPress: () => navigation.navigate('TransactionForm', { type: 'income' }),
    },
    {
      label: 'Nova despesa',
      subtitle: 'Controlar gasto',
      icon: 'arrow-up-outline',
      color: colors.danger,
      bg: `${colors.danger}16`,
      onPress: () => navigation.navigate('TransactionForm', { type: 'expense' }),
    },
    {
      label: 'Minhas metas',
      subtitle: 'Acompanhar objetivos',
      icon: 'flag-outline',
      color: '#8B5CF6',
      bg: '#8B5CF616',
      onPress: () => navigation.navigate('Goals'),
    },
    {
      label: 'Relatórios',
      subtitle: 'Ver análises',
      icon: 'bar-chart-outline',
      color: '#3B82F6',
      bg: '#3B82F616',
      onPress: () => navigation.navigate('ResumoFinanceiro'),
    },
  ];

  const bankAccounts = [
    {
      name: 'Conta principal',
      bank: 'Byte Bank',
      balance: 2840.5,
      icon: 'wallet-outline',
      color: colors.accent,
    },
    {
      name: 'Reserva',
      bank: 'Poupança',
      balance: 1240.0,
      icon: 'shield-checkmark-outline',
      color: '#3B82F6',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />

      <Navbar theme={colors} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Olá, {firstName} 👋
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Veja seu panorama financeiro de forma clara, prática e inteligente.
            </Text>
          </View>

          {/* CARD PRINCIPAL */}
          <View
            style={[
              styles.mainCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Saldo total
                </Text>

                <Text style={[styles.balanceText, { color: colors.text }]}>
                  {showBalance
                    ? formatCurrency(financialData.balance)
                    : 'R$ ••••••'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.eyeButton,
                  { backgroundColor: `${colors.textSecondary}14` },
                ]}
                onPress={() => setShowBalance(!showBalance)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.miniStatsRow}>
              <View style={styles.miniStat}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: `${colors.success}18` },
                  ]}
                >
                  <Ionicons
                    name="trending-up-outline"
                    size={16}
                    color={colors.success}
                  />
                </View>

                <View>
                  <Text
                    style={[styles.miniStatLabel, { color: colors.textSecondary }]}
                  >
                    Entradas
                  </Text>
                  <Text style={[styles.miniStatValue, { color: colors.success }]}>
                    {showBalance
                      ? formatCurrency(financialData.income)
                      : 'R$ ••••'}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.statDivider, { backgroundColor: colors.border }]}
              />

              <View style={styles.miniStat}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: `${colors.danger}18` },
                  ]}
                >
                  <Ionicons
                    name="trending-down-outline"
                    size={16}
                    color={colors.danger}
                  />
                </View>

                <View>
                  <Text
                    style={[styles.miniStatLabel, { color: colors.textSecondary }]}
                  >
                    Saídas
                  </Text>
                  <Text style={[styles.miniStatValue, { color: colors.danger }]}>
                    {showBalance
                      ? formatCurrency(financialData.expense)
                      : 'R$ ••••'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* AÇÕES RÁPIDAS */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ações rápidas
          </Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.85}
                onPress={action.onPress}
              >
                <View
                  style={[
                    styles.quickActionIconWrap,
                    {
                      backgroundColor: action.bg,
                      borderColor: `${action.color}28`,
                    },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>

                <View style={styles.quickActionTextWrap}>
                  <Text
                    style={[styles.quickActionTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {action.label}
                  </Text>

                  <Text
                    style={[
                      styles.quickActionSubtitle,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {action.subtitle}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* CONEXÃO BANCÁRIA */}
          <View
            style={[
              styles.connectionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.connectionLeft}>
              <View
                style={[
                  styles.connectionIconWrap,
                  { backgroundColor: `${colors.accent}18` },
                ]}
              >
                <MaterialCommunityIcons
                  name="bank-check"
                  size={22}
                  color={colors.accent}
                />
              </View>

              <View style={styles.connectionTextWrap}>
                <Text style={[styles.connectionTitle, { color: colors.text }]}>
                  Conectar contas bancárias
                </Text>

                <Text
                  style={[
                    styles.connectionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Centralize seus saldos e acompanhe tudo em um só lugar.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.connectionBtn,
                { backgroundColor: colors.accent },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.connectionBtnText}>Conectar</Text>
            </TouchableOpacity>
          </View>

          {/* CONTAS BANCÁRIAS */}
          <View style={styles.recentHeader}>
            <Text
              style={[
                styles.sectionTitle,
                styles.sectionNoMargin,
                { color: colors.text },
              ]}
            >
              Minhas contas
            </Text>

            <TouchableOpacity activeOpacity={0.8}>
              <Text style={[styles.seeAllText, { color: colors.accent }]}>
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>

          {bankAccounts.map((account, index) => (
            <View
              key={index}
              style={[
                styles.accountCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.accountLeft}>
                <View
                  style={[
                    styles.accountIconWrap,
                    { backgroundColor: `${account.color}18` },
                  ]}
                >
                  <Ionicons
                    name={account.icon as any}
                    size={22}
                    color={account.color}
                  />
                </View>

                <View>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  <Text
                    style={[styles.accountBank, { color: colors.textSecondary }]}
                  >
                    {account.bank}
                  </Text>
                </View>
              </View>

              <Text style={[styles.accountBalance, { color: colors.text }]}>
                {showBalance ? formatCurrency(account.balance) : 'R$ ••••'}
              </Text>
            </View>
          ))}

          {/* META PRINCIPAL */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Meta principal
          </Text>

          <View
            style={[
              styles.goalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.goalHeader}>
              <Text style={[styles.goalTitle, { color: colors.text }]}>
                Viagem / Reserva financeira
              </Text>

              <Text style={[styles.goalPercent, { color: colors.accent }]}>
                {goalProgress.toFixed(0)}%
              </Text>
            </View>

            <View
              style={[
                styles.progressBarBg,
                { backgroundColor: `${colors.textSecondary}18` },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${goalProgress}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>

            <View style={styles.goalValuesRow}>
              <Text
                style={[styles.goalValueText, { color: colors.textSecondary }]}
              >
                Guardado: {formatCurrency(savingsGoal.current)}
              </Text>

              <Text
                style={[styles.goalValueText, { color: colors.textSecondary }]}
              >
                Meta: {formatCurrency(savingsGoal.target)}
              </Text>
            </View>
          </View>

          {/* ÚLTIMOS LANÇAMENTOS */}
          <View style={styles.recentHeader}>
            <Text
              style={[
                styles.sectionTitle,
                styles.sectionNoMargin,
                { color: colors.text },
              ]}
            >
              Novos lançamentos
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Transactions')}
            >
              <Text style={[styles.seeAllText, { color: colors.accent }]}>
                Ver tudo
              </Text>
            </TouchableOpacity>
          </View>

          {financialData.recentTransactions.length > 0 ? (
            financialData.recentTransactions.map((transaction: any, index: number) => {
              const isIncome = transaction?.type === 'income';
              const iconName = isIncome
                ? 'arrow-down-outline'
                : 'arrow-up-outline';

              const iconColor = isIncome ? colors.success : colors.danger;
              const iconBg = isIncome
                ? `${colors.success}18`
                : `${colors.danger}18`;

              return (
                <View
                  key={transaction?.id || index}
                  style={[
                    styles.tiContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.tiLeft}>
                    <View
                      style={[
                        styles.tiIconWrap,
                        { backgroundColor: iconBg },
                      ]}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={20}
                        color={iconColor}
                      />
                    </View>

                    <View style={styles.tiTextWrap}>
                      <Text
                        style={[styles.tiDesc, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {transaction?.description || 'Transação'}
                      </Text>

                      <Text
                        style={[styles.tiDate, { color: colors.textSecondary }]}
                      >
                        {transaction?.date
                          ? new Date(transaction.date).toLocaleDateString('pt-BR')
                          : 'Sem data'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.tiAmount,
                      { color: isIncome ? colors.success : colors.danger },
                    ]}
                  >
                    {isIncome ? '+' : '-'}
                    {showBalance
                      ? formatCurrency(Number(transaction?.amount || 0))
                      : 'R$ ••••'}
                  </Text>
                </View>
              );
            })
          ) : (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={28}
                color={colors.textSecondary}
              />

              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhuma movimentação ainda
              </Text>

              <Text
                style={[styles.emptyText, { color: colors.textSecondary }]}
              >
                Adicione sua primeira receita ou despesa para começar a acompanhar
                seu dinheiro.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    alignItems: 'center',
  },

  contentWrapper: {
    width: '100%',
    maxWidth: 860,
  },

  header: {
    marginBottom: 18,
  },

  greeting: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },

  mainCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  balanceText: {
    fontSize: 36,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -1,
  },

  eyeButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 15,
  },

  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  miniStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  miniStatValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },

  sectionNoMargin: {
    marginBottom: 0,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 26,
  },

  quickActionCard: {
    width: '48.5%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 96,
  },

  quickActionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  quickActionTextWrap: {
    flex: 1,
    marginRight: 8,
  },

  quickActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  quickActionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },

  connectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  connectionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  connectionTextWrap: {
    flex: 1,
  },

  connectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },

  connectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },

  connectionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },

  connectionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: '800',
  },

  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  accountName: {
    fontSize: 15,
    fontWeight: '800',
  },

  accountBank: {
    fontSize: 12,
    marginTop: 3,
  },

  accountBalance: {
    fontSize: 15,
    fontWeight: '900',
  },

  goalCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 30,
  },

  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  goalTitle: {
    fontWeight: '700',
    fontSize: 15,
  },

  goalPercent: {
    fontWeight: '900',
  },

  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  goalValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  goalValueText: {
    fontSize: 12,
    fontWeight: '600',
  },

  tiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },

  tiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  tiIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tiTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  tiDesc: {
    fontSize: 15,
    fontWeight: '700',
  },

  tiDate: {
    fontSize: 12,
    marginTop: 2,
  },

  tiAmount: {
    fontSize: 16,
    fontWeight: '800',
  },

  emptyState: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
});