import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'; // Removido SafeAreaView daqui
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext'; 
import { SafeAreaView } from 'react-native-safe-area-context'; // Import correto para aceitar 'edges'

export default function StatementScreen({ navigation }: any) {
  const { transactions } = useTransactions();
  const { colors } = useTheme(); 
  const [filter, setFilter] = useState<'all' | 'receita' | 'despesa'>('all');

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.type === filter);

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = value ?? 0; 
    return safeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const FilterButton = ({ title, type }: { title: string, type: 'all' | 'receita' | 'despesa' }) => {
    const isActive = filter === type;
    return (
      <TouchableOpacity 
        style={[
          styles.filterBtn, 
          isActive 
            ? { backgroundColor: colors.accent, borderColor: colors.accent } 
            : { backgroundColor: colors.card, borderColor: colors.border }
        ]} 
        onPress={() => setFilter(type)}
      >
        <Text style={[styles.filterText, isActive ? { color: '#FFF' } : { color: colors.textSecondary }]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    // 🚀 Adicionado edges=['top'] e o estilo flex: 1
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      
      {/* HEADER PADRONIZADO (Altura de 60px) */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Extrato Completo</Text>
        <View style={styles.headerBtn} /> 
      </View>

      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FilterButton title="Tudo" type="all" />
        <FilterButton title="Receitas" type="receita" />
        <FilterButton title="Despesas" type="despesa" />
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="text-box-search-outline" size={60} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma transação encontrada.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate('TransactionForm', { 
                transaction: {
                  ...item,
                  date: item.date instanceof Date ? item.date.toISOString() : String(item.date)
                }, 
                type: item.type 
              });
            }}
            style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.transactionLeft}>
              <View style={[styles.catIcon, { backgroundColor: item.type === 'receita' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)' }]}>
                <MaterialCommunityIcons 
                  name={item.type === 'receita' ? "cash-plus" : "shopping-outline"} 
                  size={24} 
                  color={item.type === 'receita' ? '#16A34A' : '#DC2626'} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.transactionDesc, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
                <Text style={[styles.transactionCat, { color: colors.textSecondary }]}>
                  {item.category} • {item.date instanceof Date ? item.date.toLocaleDateString('pt-BR') : 'Hoje'}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.transactionAmount, { color: item.type === 'receita' ? '#16A34A' : colors.text }]}>
                  {item.type === 'receita' ? '+' : '-'} {formatCurrency(item.amount)}
                </Text>
                {item.receiptUrl && (
                    <Ionicons name="attach" size={16} color={colors.textSecondary} style={{ marginTop: 4 }} />
                )}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // 🚀 Header ajustado para 60px de altura
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    height: 60,
    paddingHorizontal: 15,
    borderBottomWidth: 1 
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '700' },
  listContent: { padding: 20, paddingBottom: 100 },
  transactionItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12, 
    borderWidth: 1, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5 
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  catIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  transactionDesc: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  transactionCat: { fontSize: 12, fontWeight: '500' },
  transactionAmount: { fontSize: 15, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '500' }
});