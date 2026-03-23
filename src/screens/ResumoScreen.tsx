import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from "react-native-gifted-charts"; 
import { SafeAreaView } from 'react-native-safe-area-context'; // Import correto
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ResumoScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, theme } = useTheme();
  const [tab, setTab] = useState<'geral' | 'receita' | 'despesa'>('geral');
  const [loading, setLoading] = useState(true);
  const [dbTransactions, setDbTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date() 
      }));
      setDbTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totals = useMemo(() => {
    const r = dbTransactions.filter(t => t.type?.toLowerCase() === 'receita').reduce((a, c) => a + Number(c.amount), 0);
    const d = dbTransactions.filter(t => t.type?.toLowerCase() === 'despesa').reduce((a, c) => a + Number(c.amount), 0);
    return { r, d };
  }, [dbTransactions]);

  const barData = [
    { value: totals.r, label: 'Ganhos', frontColor: '#16A34A', spacing: 15 },
    { value: totals.d, label: 'Gastos', frontColor: '#DC2626' },
  ];

  const getPieData = (type: 'receita' | 'despesa') => {
    const filtered = dbTransactions.filter(t => t.type?.toLowerCase() === type);
    const cats: { [key: string]: { value: number, originalTransactions: any[] } } = {};
    
    filtered.forEach(t => { 
      if(!cats[t.category]) cats[t.category] = { value: 0, originalTransactions: [] };
      cats[t.category].value += Number(t.amount);
      cats[t.category].originalTransactions.push(t);
    });
    
    const palette = type === 'receita' 
      ? ['#065F46', '#059669', '#10B981', '#34D399', '#6EE7B7'] 
      : ['#991B1B', '#DC2626', '#EF4444', '#F87171', '#FCA5A5'];

    return Object.keys(cats).map((c, i) => ({
      value: cats[c].value,
      color: palette[i % palette.length],
      text: c,
      transactions: cats[c].originalTransactions
    }));
  };

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = value ?? 0; 
    return safeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getDynamicBg = () => {
    if (tab === 'receita') return theme === 'dark' ? '#052c16' : '#f0fdf4';
    if (tab === 'despesa') return theme === 'dark' ? '#450a0a' : '#fef2f2';
    return colors.background;
  };

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getDynamicBg() }]} edges={['top']}>
      
      {/* HEADER PADRONIZADO (60px) */}
      <View style={[styles.header, { borderBottomColor: tab === 'geral' ? colors.border : 'transparent' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Análise Financeira</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.tabBar}>
        {['geral', 'receita', 'despesa'].map((t) => (
          <TouchableOpacity 
            key={t} 
            onPress={() => setTab(t as any)}
            style={[styles.tabItem, tab === t && { borderBottomColor: t === 'receita' ? '#16A34A' : t === 'despesa' ? '#DC2626' : colors.accent, borderBottomWidth: 3 }]}
          >
            <Text style={[styles.tabText, { color: tab === t ? colors.text : colors.textSecondary }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {tab === 'geral' ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>Balanço de Fluxo</Text>
              <BarChart
                data={barData}
                barWidth={45}
                noOfSections={3}
                barBorderRadius={12}
                isAnimated
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }}
              />
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>{`Gastos por Categoria`}</Text>
              <PieChart
                data={getPieData(tab as any).length > 0 ? getPieData(tab as any) : [{ value: 1, color: colors.border }]}
                donut
                radius={90}
                innerRadius={70}
                innerCircleColor={colors.card}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                        {formatCurrency(tab === 'receita' ? totals.r : totals.d)}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>TOTAL</Text>
                  </View>
                )}
              />
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {tab === 'geral' ? 'Resumo de Contas' : `Detalhes de ${tab}`}
        </Text>

        {(tab === 'geral' ? 
            [{ label: 'Total Recebido', val: totals.r, col: '#16A34A', type: 'receita' }, 
             { label: 'Total Gasto', val: totals.d, col: '#DC2626', type: 'despesa' }] 
            : getPieData(tab as any)
        ).map((item: any, i) => (
          <TouchableOpacity 
            key={i} 
            activeOpacity={0.7}
            onPress={() => {
                if(tab !== 'geral' && item.transactions?.length > 0) {
                    navigation.navigate('TransactionForm', { 
                        transaction: { ...item.transactions[0], date: item.transactions[0].date.toISOString() }, 
                        type: tab 
                    });
                }
            }}
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: item.color || item.col }]} />
              <Text style={{ color: colors.text, fontWeight: '700' }}>{item.text || item.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', marginRight: 10 }}>{formatCurrency(item.value || item.val)}</Text>
                {tab !== 'geral' && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
            </View>
          </TouchableOpacity>
        ))}

        {dbTransactions.length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>
                Nenhum dado para exibir.
            </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Header padronizado com 60px de altura
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    height: 60, 
    paddingHorizontal: 15, 
    borderBottomWidth: 0.5 
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginTop: 5 },
  tabItem: { paddingVertical: 12, paddingHorizontal: 20 },
  tabText: { fontSize: 12, fontWeight: '800' },
  scroll: { padding: 20, paddingBottom: 50 },
  mainCard: { 
    padding: 25, 
    borderRadius: 30, 
    borderWidth: 1, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 15, 
    marginBottom: 25 
  },
  cardTitle: { fontSize: 11, fontWeight: '800', marginBottom: 25, textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 18, 
    borderRadius: 20, 
    marginBottom: 10, 
    borderWidth: 1, 
    alignItems: 'center' 
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 }
});