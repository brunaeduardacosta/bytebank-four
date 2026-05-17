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
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTransactions } from '../../contexts/TransactionContext'; 
import Navbar from '../../components/ui/Navbar';

const { width } = Dimensions.get('window');

type TabType = 'geral' | 'receita' | 'despesa';
type PeriodFilter = 'todos' | 'hoje' | '7dias' | '30dias';

export default function ResumoScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, theme } = useTheme();
  
  // Pegando as transações e o estado de carregamento direto do Contexto
  const { transactions, loading } = useTransactions();

  const [tab, setTab] = useState<TabType>('geral');

  // Filtros avançados
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('todos');
  const [showFilters, setShowFilters] = useState(false);

  // Paginação
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Cores semânticas de sucesso/erro fixas
  const successColor = '#10B981';
  const dangerColor = '#EF4444';

  // Sempre volta para a página 1 quando mudar filtros/aba
  useEffect(() => {
    setPage(1);
  }, [tab, searchText, categoryFilter, periodFilter]);

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = value ?? 0;
    return safeValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  // Categorias disponíveis dinamicamente baseadas nas transações do Contexto
  const availableCategories = useMemo(() => {
    const categories = transactions
      .map((t) => t.category?.trim())
      .filter(Boolean);

    return [...new Set(categories)].sort();
  }, [transactions]);

  // Função para filtrar por período
  const matchesPeriod = (date: Date) => {
    const now = new Date();
    if (periodFilter === 'todos') return true;

    if (periodFilter === 'hoje') {
      return date.toDateString() === now.toDateString();
    }

    if (periodFilter === '7dias') {
      const last7 = new Date();
      last7.setDate(now.getDate() - 7);
      return date >= last7 && date <= now;
    }

    if (periodFilter === '30dias') {
      const last30 = new Date();
      last30.setDate(now.getDate() - 30);
      return date >= last30 && date <= now;
    }

    return true;
  };

  // Base filtrada para usar em tudo (lista, totais, gráficos)
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtrar por aba
    if (tab !== 'geral') {
      filtered = filtered.filter((t) => t.type?.toLowerCase() === tab);
    }

    // Busca por descrição
    if (searchText.trim()) {
      filtered = filtered.filter((t) =>
        String(t.description || '')
          .toLowerCase()
          .includes(searchText.trim().toLowerCase())
      );
    }

    // Filtro por categoria
    if (categoryFilter) {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Filtro por período
    filtered = filtered.filter((t) => matchesPeriod(t.date));

    // Ordenação por data (mais recente primeiro)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    return filtered;
  }, [transactions, tab, searchText, categoryFilter, periodFilter]);

  // Totais (baseados nos filtros, mas respeitando o tipo)
  const totals = useMemo(() => {
    const receita = filteredTransactions
      .filter((t) => t.type?.toLowerCase() === 'receita')
      .reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

    const despesa = filteredTransactions
      .filter((t) => t.type?.toLowerCase() === 'despesa')
      .reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

    const saldo = receita - despesa;

    return { receita, despesa, saldo };
  }, [filteredTransactions]);

  // Dados do gráfico de barras
  const barData = useMemo(
    () => [
      { value: totals.receita, label: 'Receitas', frontColor: successColor, spacing: 18 },
      { value: totals.despesa, label: 'Despesas', frontColor: dangerColor },
    ],
    [totals, successColor, dangerColor]
  );

  // Dados do gráfico de pizza por categoria
  const getPieData = (type: 'receita' | 'despesa') => {
    const filtered = filteredTransactions.filter((t) => t.type?.toLowerCase() === type);
    const categories: { [key: string]: { value: number; originalTransactions: any[] } } = {};

    filtered.forEach((t) => {
      const categoryName = t.category?.trim() || 'Sem categoria';
      if (!categories[categoryName]) {
        categories[categoryName] = { value: 0, originalTransactions: [] };
      }
      categories[categoryName].value += Number(t.amount || 0);
      categories[categoryName].originalTransactions.push(t);
    });

    // Paletas suaves que combinam com Dark Mode e Light Mode
    const palette = type === 'receita'
        ? ['#065F46', '#059669', successColor, '#34D399', '#6EE7B7', '#A7F3D0']
        : ['#7F1D1D', '#B91C1C', dangerColor, '#EF4444', '#F87171', '#FCA5A5'];

    const totalType = type === 'receita' ? totals.receita || 1 : totals.despesa || 1;

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

  const receitaPieData = useMemo(() => getPieData('receita'), [filteredTransactions, totals.receita]);
  const despesaPieData = useMemo(() => getPieData('despesa'), [filteredTransactions, totals.despesa]);
  const currentPieData = tab === 'receita' ? receitaPieData : despesaPieData;

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, page]);

  const getDynamicBg = () => {
    if (tab === 'receita') return theme === 'dark' ? '#04170d' : '#f0fdf4';
    if (tab === 'despesa') return theme === 'dark' ? '#220808' : '#fef2f2';
    return colors.background;
  };

  const clearFilters = () => {
    setSearchText('');
    setCategoryFilter(null);
    setPeriodFilter('todos');
    setPage(1);
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <Navbar theme={colors} />
        <View style={styles.navbarSpacer} /> {/* Espaçador adicionado no loading também */}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Carregando análise...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: getDynamicBg() }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Navbar theme={colors} />

      {/* ESPAÇADOR DA NAVBAR - Zerado no StyleSheet para remover o vão artificial */}
      <View style={styles.navbarSpacer} />

      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Resumo Financeiro</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Visão geral dos seus lançamentos</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Ionicons name={showFilters ? 'options' : 'options-outline'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* FILTROS AVANÇADOS */}
      {showFilters && (
        <View style={[styles.filterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Filtros avançados</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={[styles.clearFilterText, { color: colors.accent }]}>Limpar</Text>
            </TouchableOpacity>
          </View>

          {/* Busca */}
          <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="Buscar por descrição..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          {/* Período */}
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Período</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'hoje', label: 'Hoje' },
              { key: '7dias', label: '7 dias' },
              { key: '30dias', label: '30 dias' },
            ].map((item) => {
              const active = periodFilter === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setPeriodFilter(item.key as PeriodFilter)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.accent : colors.background,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Categorias */}
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
            <TouchableOpacity
              onPress={() => setCategoryFilter(null)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                {
                  backgroundColor: categoryFilter === null ? colors.accent : colors.background,
                  borderColor: categoryFilter === null ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: categoryFilter === null ? '#fff' : colors.text }]}>Todas</Text>
            </TouchableOpacity>

            {availableCategories.map((category) => {
              const active = categoryFilter === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setCategoryFilter(active ? null : category)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.accent : colors.background,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* TABS */}
      <View style={[styles.tabsWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(['geral', 'receita', 'despesa'] as TabType[]).map((item) => {
          const active = tab === item;
          const accent = item === 'receita' ? successColor : item === 'despesa' ? dangerColor : colors.accent;

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
                name={item === 'geral' ? 'stats-chart' : item === 'receita' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={16}
                color={active ? '#fff' : colors.textSecondary}
              />
              <Text style={[styles.tabText, { color: active ? '#fff' : colors.textSecondary }]}>
                {item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* RESUMO RÁPIDO */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Receitas</Text>
            <Text style={[styles.summaryValue, { color: successColor }]}>{formatCurrency(totals.receita)}</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Despesas</Text>
            <Text style={[styles.summaryValue, { color: dangerColor }]}>{formatCurrency(totals.despesa)}</Text>
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Saldo do Período</Text>
          <Text style={[styles.balanceValue, { color: totals.saldo >= 0 ? successColor : dangerColor }]}>
            {formatCurrency(totals.saldo)}
          </Text>
        </View>

        {/* GRÁFICO PRINCIPAL */}
        <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {tab === 'geral' ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Fluxo Financeiro</Text>
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
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.text, fontWeight: '700', fontSize: 12 }}
              />
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                {tab === 'receita' ? 'Receitas por Categoria' : 'Despesas por Categoria'}
              </Text>

              <PieChart
                data={currentPieData.length > 0 ? currentPieData : [{ value: 1, color: colors.border }]}
                donut
                radius={92}
                innerRadius={68}
                innerCircleColor={colors.card}
                showText={false}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                      {formatCurrency(tab === 'receita' ? totals.receita : totals.despesa)}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2, fontWeight: '700' }}>
                      TOTAL
                    </Text>
                  </View>
                )}
              />

              {/* LEGENDA DO GRÁFICO */}
              {currentPieData.length > 0 && (
                <View style={styles.legendWrapper}>
                  {currentPieData.slice(0, 5).map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.legendText, { color: colors.text }]} numberOfLines={1}>
                        {item.text} ({item.percent}%)
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* LISTA FILTRADA + PAGINADA */}
        <View style={{ marginTop: 4 }}>
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lançamentos</Text>
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {filteredTransactions.length} resultado(s)
            </Text>
          </View>

          {paginatedTransactions.length > 0 ? (
            <>
              {paginatedTransactions.map((item, index) => {
                const isIncome = item.type?.toLowerCase() === 'receita';
                return (
                  <TouchableOpacity
                    key={item.id || index}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('TransactionForm', {
                        transaction: item,
                        type: isIncome ? 'receita' : 'despesa',
                      })
                    }
                  >
                    <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={[styles.iconBox, { backgroundColor: isIncome ? `${successColor}15` : `${dangerColor}15` }]}>
                        <MaterialCommunityIcons name={isIncome ? 'plus' : 'minus'} size={20} color={isIncome ? successColor : dangerColor} />
                      </View>

                      <View style={styles.cardLeft}>
                        <Text style={[styles.itemDesc, { color: colors.text }]} numberOfLines={1}>
                          {item.description || 'Sem descrição'}
                        </Text>
                        <View style={styles.itemMetaRow}>
                          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{item.category || 'Outros'}</Text>
                          <Text style={[styles.itemMetaDot, { color: colors.textSecondary }]}>•</Text>
                          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
                        </View>
                      </View>

                      <Text style={[styles.itemAmount, { color: isIncome ? successColor : dangerColor }]}>
                        {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* PAGINAÇÃO */}
              {totalPages > 1 && (
                <View style={[styles.paginationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TouchableOpacity
                    disabled={page === 1}
                    onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                    style={[
                      styles.paginationBtn,
                      { backgroundColor: page === 1 ? colors.border : colors.accent, opacity: page === 1 ? 0.6 : 1 },
                    ]}
                  >
                    <Ionicons name="chevron-back" size={16} color="#fff" />
                    <Text style={styles.paginationBtnText}>Anterior</Text>
                  </TouchableOpacity>

                  <Text style={[styles.pageText, { color: colors.text }]}>
                    Página {page} de {totalPages}
                  </Text>

                  <TouchableOpacity
                    disabled={page >= totalPages}
                    onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    style={[
                      styles.paginationBtn,
                      { backgroundColor: page >= totalPages ? colors.border : colors.accent, opacity: page >= totalPages ? 0.6 : 1 },
                    ]}
                  >
                    <Text style={styles.paginationBtnText}>Próxima</Text>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={34} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum lançamento encontrado</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Tente ajustar os filtros.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1 },
  loadingContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navbarSpacer: { height: 0 }, // Corrigido para 0 para alinhar perfeitamente com a Navbar fixa

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, marginTop: 16 }, // Adicionado marginTop para respiro adequado
  headerBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  headerSubtitle: { fontSize: 11, marginTop: 2, fontWeight: '600', textAlign: 'center' },

  tabsWrapper: { flexDirection: 'row', marginHorizontal: 20, marginTop: 14, marginBottom: 6, padding: 6, borderRadius: 18, borderWidth: 1 },
  tabItem: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14 },
  tabText: { fontSize: 12, fontWeight: '800' },

  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 100 },

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderWidth: 1, borderRadius: 22, padding: 16 },
  summaryLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  summaryValue: { fontSize: 16, fontWeight: '900' },

  balanceCard: { borderWidth: 1, borderRadius: 24, padding: 18, marginBottom: 16 },
  balanceLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  balanceValue: { fontSize: 22, fontWeight: '900' },

  filterCard: { borderWidth: 1, borderRadius: 24, padding: 16, marginHorizontal: 20, marginTop: 12, marginBottom: 8 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterTitle: { fontSize: 16, fontWeight: '800' },
  clearFilterText: { fontSize: 13, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, marginTop: 14, marginBottom: 14, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  filterLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 2 },
  filterChipsRow: { paddingBottom: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 12, fontWeight: '700' },

  mainCard: { paddingVertical: 24, paddingHorizontal: 18, borderRadius: 28, borderWidth: 1, marginBottom: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 4 },
  cardTitle: { fontSize: 11, fontWeight: '800', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center' },

  legendWrapper: { width: '100%', marginTop: 20, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 99, marginRight: 8 },
  legendText: { fontSize: 12, fontWeight: '600', flex: 1 },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginLeft: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  resultCount: { fontSize: 12, fontWeight: '600' },

  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 22, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardLeft: { flex: 1, marginLeft: 12 },
  itemDesc: { fontWeight: '700', fontSize: 15 },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  itemMeta: { fontSize: 11, fontWeight: '500' },
  itemMetaDot: { marginHorizontal: 6, fontSize: 11, fontWeight: '700' },
  itemAmount: { fontWeight: '900', fontSize: 15, marginLeft: 10 },

  paginationCard: { marginTop: 8, borderWidth: 1, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paginationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14 },
  paginationBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  pageText: { fontSize: 12, fontWeight: '700' },

  emptyState: { borderWidth: 1, borderRadius: 24, paddingVertical: 28, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: '800' },
  emptySubtitle: { marginTop: 6, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});