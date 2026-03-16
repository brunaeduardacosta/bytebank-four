import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';

import { useTransactions } from '../context/TransactionContext';

export default function ResumoScreen({ navigation }: any) {
  const { transactions } = useTransactions();
  
  // Estados para navegação e filtros
  const [activeTab, setActiveTab] = useState<'despesa' | 'receita'>('despesa');
  const [sortBy, setSortBy] = useState<'value' | 'category'>('value');
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'year' | 'all'>('month');

  // --- LÓGICA DE FILTRAGEM E AGRUPAMENTO DINÂMICO ---
  const { chartData, totalAmount, legendData } = useMemo(() => {
    const now = new Date();

    // 1. Função segura para converter a data da transação
    const getTxDate = (dateVal: any) => {
      if (!dateVal) return new Date();
      if (dateVal instanceof Date) return dateVal;
      if (typeof dateVal === 'string') {
        const parts = dateVal.split('/');
        if (parts.length === 3) {
          // Formato DD/MM/YYYY para Date do JS
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        return new Date(dateVal); // Tenta o formato padrão ISO
      }
      return new Date();
    };

    // 2. Filtra por Aba (Receita/Despesa) e por Data
    const filteredTransactions = transactions.filter(t => {
      if (t.type !== activeTab) return false;

      const txDate = getTxDate(t.date);

      if (dateFilter === 'year') {
        return txDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'month') {
        return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      }
      if (dateFilter === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Volta para o Domingo
        startOfWeek.setHours(0, 0, 0, 0);
        return txDate >= startOfWeek;
      }
      return true; // 'all' (Tudo)
    });

    const total = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Agrupa por categoria
    const grouped = filteredTransactions.reduce((acc: any, curr) => {
      const cat = curr.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {});

    // Paletas de cores dinâmicas sem gradientes problemáticos (Cores Sólidas Premium)
    const expenseColors = ['#DC2626', '#D97706', '#8B5CF6', '#F59E0B', '#E11D48', '#C026D3'];
    const incomeColors = ['#16A34A', '#0284C7', '#0D9488', '#2563EB', '#059669', '#0891B2'];
    const colors = activeTab === 'despesa' ? expenseColors : incomeColors;

    // 4. Monta o Array para o Gráfico e para a Legenda
    let colorIndex = 0;
    const formattedChartData: any[] = [];
    const formattedLegend: any[] = [];

    Object.keys(grouped).forEach((key) => {
      const value = grouped[key];
      const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
      const color = colors[colorIndex % colors.length];

      formattedChartData.push({
        value,
        color,
        focused: colorIndex === 0, 
      });

      formattedLegend.push({
        name: key,
        value,
        percentage,
        color,
        icon: getCategoryIcon(key)
      });

      colorIndex++;
    });

    // 5. Aplica a Ordenação (Filtro A-Z ou Maior Valor)
    if (sortBy === 'value') {
      formattedLegend.sort((a, b) => b.value - a.value);
    } else {
      formattedLegend.sort((a, b) => a.name.localeCompare(b.name));
    }

    return { chartData: formattedChartData, totalAmount: total, legendData: formattedLegend };
  }, [transactions, activeTab, sortBy, dateFilter]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <View style={styles.spacer} />
      </View>

      {/* SELETOR DE ABAS (RECEITAS / DESPESAS) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'despesa' ? styles.tabActiveExpense : styles.tabInactive]}
          onPress={() => setActiveTab('despesa')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'despesa' ? styles.tabTextActiveExpense : styles.tabTextInactive]}>Despesas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'receita' ? styles.tabActiveIncome : styles.tabInactive]}
          onPress={() => setActiveTab('receita')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'receita' ? styles.tabTextActiveIncome : styles.tabTextInactive]}>Receitas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* GRÁFICO ANIMADO (Sem showGradient para evitar erro de cor) */}
        <View style={styles.chartContainer}>
          {totalAmount > 0 ? (
            <View style={styles.centerView}>
              <PieChart
                data={chartData}
                donut
                sectionAutoFocus
                radius={110}
                innerRadius={75}
                innerCircleColor="#FFFFFF"
                centerLabelComponent={() => (
                  <View style={styles.centerView}>
                    <Text style={styles.chartCenterLabel}>
                      {activeTab === 'despesa' ? 'Saídas' : 'Entradas'}
                    </Text>
                    <Text style={[styles.chartCenterValue, { color: activeTab === 'despesa' ? '#DC2626' : '#16A34A' }]}>
                      {formatCurrency(totalAmount)}
                    </Text>
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="pie-chart-outline" size={60} color="#E2E8F0" />
              <Text style={styles.emptyText}>Sem registos neste período.</Text>
            </View>
          )}
        </View>

        {/* ÁREA DE FILTROS E LISTA */}
        <View style={styles.listSection}>
          
          {/* BLOCO DE FILTROS HORIZONTAIS */}
          <View style={styles.filtersBlock}>
            <Text style={styles.filterGroupLabel}>Período:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <FilterChip label="Esta Semana" active={dateFilter === 'week'} onPress={() => setDateFilter('week')} />
              <FilterChip label="Este Mês" active={dateFilter === 'month'} onPress={() => setDateFilter('month')} />
              <FilterChip label="Este Ano" active={dateFilter === 'year'} onPress={() => setDateFilter('year')} />
              <FilterChip label="Tudo" active={dateFilter === 'all'} onPress={() => setDateFilter('all')} />
            </ScrollView>

            <Text style={[styles.filterGroupLabel, { marginTop: 15 }]}>Ordenar por:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <FilterChip label="Maior Valor" active={sortBy === 'value'} onPress={() => setSortBy('value')} />
              <FilterChip label="Nome (A-Z)" active={sortBy === 'category'} onPress={() => setSortBy('category')} />
            </ScrollView>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.legendTitle}>Detalhes por Categoria</Text>
          </View>
          
          {legendData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '1A' }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                </View>
                <View>
                  <Text style={styles.catName}>{item.name}</Text>
                  <Text style={styles.catPercent}>{`${item.percentage}% do total`}</Text>
                </View>
              </View>
              <Text style={styles.catValue}>{formatCurrency(item.value)}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- COMPONENTE AUXILIAR PARA OS CHIPS DE FILTRO ---
function FilterChip({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity 
      style={[styles.filterChip, active ? styles.filterChipActive : styles.filterChipInactive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Helper para escolher o ícone baseado no nome
function getCategoryIcon(category: string) {
  const cat = category.toLowerCase();
  // Despesas
  if (cat.includes('alimentaç') || cat.includes('comida') || cat.includes('ifood')) return 'food-fork-drink';
  if (cat.includes('transporte') || cat.includes('uber') || cat.includes('gasolina')) return 'car';
  if (cat.includes('casa') || cat.includes('moradia') || cat.includes('luz')) return 'home-city-outline';
  if (cat.includes('lazer') || cat.includes('festa') || cat.includes('cinema')) return 'party-popper';
  if (cat.includes('saúde') || cat.includes('farmacia')) return 'pill';
  // Receitas
  if (cat.includes('salário') || cat.includes('pagamento')) return 'cash-multiple';
  if (cat.includes('investimento') || cat.includes('rendimento')) return 'trending-up';
  if (cat.includes('pix') || cat.includes('transferência')) return 'bank-transfer';
  return 'tag-outline';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  spacer: { width: 38 },
  
  tabsContainer: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15,
    backgroundColor: '#FFF', gap: 10
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabInactive: { backgroundColor: '#F1F5F9' },
  tabActiveExpense: { backgroundColor: '#FEE2E2' },
  tabActiveIncome: { backgroundColor: '#DCFCE7' },
  tabText: { fontWeight: '600' },
  tabTextInactive: { color: '#6B7280' },
  tabTextActiveExpense: { color: '#DC2626' },
  tabTextActiveIncome: { color: '#16A34A' },

  scrollContent: { paddingBottom: 40 },
  
  chartContainer: {
    backgroundColor: '#FFF', margin: 20, marginTop: 10, paddingVertical: 30,
    borderRadius: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  centerView: { justifyContent: 'center', alignItems: 'center' },
  chartCenterLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  chartCenterValue: { fontSize: 22, fontWeight: 'bold' },
  emptyChart: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 15, color: '#94A3B8', fontSize: 16, fontWeight: '500' },

  listSection: { paddingHorizontal: 20 },
  
  // FILTROS
  filtersBlock: { marginBottom: 25 },
  filterGroupLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterScroll: { paddingBottom: 5 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterChipInactive: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: '#FFF', borderColor: '#47A138' },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  filterChipTextInactive: { color: '#6B7280' },
  filterChipTextActive: { color: '#47A138' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  legendTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  
  legendItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  legendLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  catName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  catPercent: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  catValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' }
});