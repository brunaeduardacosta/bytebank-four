import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/ui/Navbar';

const { width } = Dimensions.get('window');

type TabType = 'geral' | 'receita' | 'despesa';

export default function ResumoScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, theme } = useTheme();

  const [tab, setTab] = useState<TabType>('geral');
  const [loading, setLoading] = useState(true);
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(),
      }));

      setDbTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = value ?? 0;
    return safeValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const totals = useMemo(() => {
    const receita = dbTransactions
      .filter((t) => t.type?.toLowerCase() === 'receita')
      .reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

    const despesa = dbTransactions
      .filter((t) => t.type?.toLowerCase() === 'despesa')
      .reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

    const saldo = receita - despesa;

    return { receita, despesa, saldo };
  }, [dbTransactions]);

  const barData = useMemo(
    () => [
      {
        value: totals.receita,
        label: 'Receitas',
        frontColor: '#16A34A',
        spacing: 18,
      },
      {
        value: totals.despesa,
        label: 'Despesas',
        frontColor: '#DC2626',
      },
    ],
    [totals]
  );

  const getPieData = (type: 'receita' | 'despesa') => {
    const filtered = dbTransactions.filter(
      (t) => t.type?.toLowerCase() === type
    );

    const categories: {
      [key: string]: { value: number; originalTransactions: any[] };
    } = {};

    filtered.forEach((t) => {
      const categoryName = t.category?.trim() || 'Sem categoria';

      if (!categories[categoryName]) {
        categories[categoryName] = {
          value: 0,
          originalTransactions: [],
        };
      }

      categories[categoryName].value += Number(t.amount || 0);
      categories[categoryName].originalTransactions.push(t);
    });

    const palette =
      type === 'receita'
        ? ['#065F46', '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0']
        : ['#7F1D1D', '#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5'];

    const totalType =
      type === 'receita' ? totals.receita || 1 : totals.despesa || 1;

    return Object.keys(categories)
      .map((category, index) => ({
        value: categories[category].value,
        color: palette[index % palette.length],
        text: category,
        transactions: categories[category].originalTransactions,
        percent: ((categories[category].value / totalType) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  };

  const receitaPieData = useMemo(
    () => getPieData('receita'),
    [dbTransactions, totals.receita]
  );

  const despesaPieData = useMemo(
    () => getPieData('despesa'),
    [dbTransactions, totals.despesa]
  );

  const currentPieData = tab === 'receita' ? receitaPieData : despesaPieData;

  const getDynamicBg = () => {
    if (tab === 'receita') return theme === 'dark' ? '#04170d' : '#f0fdf4';
    if (tab === 'despesa') return theme === 'dark' ? '#220808' : '#fef2f2';
    return colors.background;
  };

  const getTabAccent = (currentTab: TabType) => {
    if (currentTab === 'receita') return '#16A34A';
    if (currentTab === 'despesa') return '#DC2626';
    return colors.accent;
  };

  const getTabIcon = (currentTab: TabType) => {
    if (currentTab === 'geral') return 'stats-chart';
    if (currentTab === 'receita') return 'arrow-down-circle';
    return 'arrow-up-circle';
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <Navbar theme={colors} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
            Carregando análise financeira...
          </Text>
        </View>
      </View>
    );
  }

  const summaryList =
    tab === 'geral'
      ? [
          {
            label: 'Total Recebido',
            value: totals.receita,
            color: '#16A34A',
            icon: 'arrow-down-circle',
          },
          {
            label: 'Total Gasto',
            value: totals.despesa,
            color: '#DC2626',
            icon: 'arrow-up-circle',
          },
          {
            label: 'Saldo Líquido',
            value: totals.saldo,
            color: totals.saldo >= 0 ? '#2563EB' : '#F59E0B',
            icon: 'wallet',
          },
        ]
      : currentPieData;

  return (
    <View style={[styles.container, { backgroundColor: getDynamicBg() }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      {/* NAVBAR GLOBAL */}
      <Navbar theme={colors} />

      {/* HEADER DA PÁGINA */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              theme === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(15,23,42,0.06)',
            backgroundColor: getDynamicBg(),
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.headerBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Resumo Financeiro
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Visão geral dos seus lançamentos
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.headerBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View
        style={[
          styles.tabsWrapper,
          {
            backgroundColor: theme === 'dark' ? '#111827' : '#F3F4F6',
            borderColor: colors.border,
          },
        ]}
      >
        {(['geral', 'receita', 'despesa'] as TabType[]).map((item) => {
          const active = tab === item;
          const accent = getTabAccent(item);

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.9}
              onPress={() => setTab(item)}
              style={[
                styles.tabItem,
                active && {
                  backgroundColor: accent,
                  shadowColor: accent,
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            >
              <Ionicons
                name={getTabIcon(item) as any}
                size={16}
                color={active ? '#fff' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active ? '#fff' : colors.textSecondary,
                  },
                ]}
              >
                {item === 'geral'
                  ? 'Geral'
                  : item === 'receita'
                  ? 'Receitas'
                  : 'Despesas'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* CARD DE DESTAQUE */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
                {tab === 'geral'
                  ? 'Saldo Atual'
                  : tab === 'receita'
                  ? 'Total de Receitas'
                  : 'Total de Despesas'}
              </Text>

              <Text style={[styles.heroValue, { color: colors.text }]}>
                {formatCurrency(
                  tab === 'geral'
                    ? totals.saldo
                    : tab === 'receita'
                    ? totals.receita
                    : totals.despesa
                )}
              </Text>
            </View>

            <View
              style={[
                styles.heroIconBadge,
                {
                  backgroundColor:
                    tab === 'geral'
                      ? theme === 'dark'
                        ? '#1E3A8A'
                        : '#DBEAFE'
                      : tab === 'receita'
                      ? theme === 'dark'
                        ? '#14532D'
                        : '#DCFCE7'
                      : theme === 'dark'
                      ? '#7F1D1D'
                      : '#FEE2E2',
                },
              ]}
            >
              <Ionicons
                name={
                  tab === 'geral'
                    ? 'wallet-outline'
                    : tab === 'receita'
                    ? 'trending-up-outline'
                    : 'trending-down-outline'
                }
                size={24}
                color={
                  tab === 'geral'
                    ? '#2563EB'
                    : tab === 'receita'
                    ? '#16A34A'
                    : '#DC2626'
                }
              />
            </View>
          </View>

          <Text style={[styles.heroHint, { color: colors.textSecondary }]}>
            {tab === 'geral'
              ? totals.saldo >= 0
                ? 'Seu fluxo financeiro está positivo.'
                : 'Atenção: suas despesas estão acima das receitas.'
              : tab === 'receita'
              ? 'Acompanhe de onde vem sua renda.'
              : 'Veja onde seu dinheiro está sendo gasto.'}
          </Text>
        </View>

        {/* GRÁFICO PRINCIPAL */}
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {tab === 'geral' ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                Fluxo Financeiro
              </Text>

              <BarChart
                data={barData}
                barWidth={48}
                noOfSections={4}
                barBorderRadius={14}
                isAnimated
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                height={220}
                spacing={30}
                yAxisTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 10,
                }}
                xAxisLabelTextStyle={{
                  color: colors.text,
                  fontWeight: '700',
                  fontSize: 12,
                }}
              />
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                {tab === 'receita'
                  ? 'Receitas por Categoria'
                  : 'Despesas por Categoria'}
              </Text>

              <PieChart
                data={
                  currentPieData.length > 0
                    ? currentPieData
                    : [{ value: 1, color: colors.border }]
                }
                donut
                radius={92}
                innerRadius={68}
                innerCircleColor={colors.card}
                showText={false}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '800',
                        color: colors.text,
                      }}
                    >
                      {formatCurrency(
                        tab === 'receita' ? totals.receita : totals.despesa
                      )}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.textSecondary,
                        marginTop: 2,
                        fontWeight: '700',
                      }}
                    >
                      TOTAL
                    </Text>
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* LISTAGEM */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {tab === 'geral'
            ? 'Indicadores Financeiros'
            : tab === 'receita'
            ? 'Categorias de Receita'
            : 'Categorias de Despesa'}
        </Text>

        {summaryList.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            onPress={() => {
              if (tab !== 'geral' && item.transactions?.length > 0) {
                navigation.navigate('TransactionForm', {
                  transaction: {
                    ...item.transactions[0],
                    date:
                      item.transactions[0].date instanceof Date
                        ? item.transactions[0].date.toISOString()
                        : item.transactions[0].date,
                  },
                  type: tab,
                });
              }
            }}
            style={[
              styles.row,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />

              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {item.text || item.label}
                </Text>

                {tab !== 'geral' && (
                  <Text
                    style={[styles.rowSubtitle, { color: colors.textSecondary }]}
                  >
                    {item.percent}% do total
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.text }]}>
                {formatCurrency(item.value)}
              </Text>

              {tab === 'geral' ? (
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.color}
                  style={{ marginLeft: 8 }}
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* ESTADO VAZIO */}
        {dbTransactions.length === 0 && (
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
              name="analytics-outline"
              size={40}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhum dado para exibir
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Adicione receitas e despesas para visualizar análises, categorias e
              comportamento financeiro.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loading: {
    flex: 1,
  },

  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 76,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },

  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },

  tabsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
  },

  tabItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },

  tabText: {
    fontSize: 12,
    fontWeight: '800',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 100,
  },

  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  heroValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
    maxWidth: width * 0.62,
  },

  heroHint: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  heroIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainCard: {
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    marginLeft: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  rowSubtitle: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },

  rowValue: {
    fontSize: 14,
    fontWeight: '900',
  },

  dot: {
    width: 13,
    height: 13,
    borderRadius: 999,
    marginRight: 12,
  },

  emptyState: {
    marginTop: 8,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 30,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },

  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});