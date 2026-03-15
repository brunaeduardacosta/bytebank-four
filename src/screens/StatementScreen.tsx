import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { COLORS } from '../theme';

export default function StatementScreen({ navigation }: any) {
  const { transactions } = useTransactions();
  
  // Estado para controlar o filtro ativo
  const [activeFilter, setActiveFilter] = useState<'tudo' | 'receita' | 'despesa'>('tudo');
  
  // Estado para simular o carregamento do Scroll Infinito
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filtra as transações com base no botão selecionado
  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'tudo') return transactions;
    return transactions.filter(t => t.type === activeFilter);
  }, [transactions, activeFilter]);

  // Função que será chamada quando o usuário chegar ao fim da lista (Scroll Infinito)
  const loadMoreTransactions = () => {
    if (isLoadingMore) return;
    
    // Aqui no futuro conectaremos com a paginação real do Firebase
    setIsLoadingMore(true);
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 1500);
  };

  // Componente visual de cada item da lista
  const renderItem = ({ item }: { item: any }) => {
    const isIncome = item.type === 'receita';
    
    return (
      <Pressable 
        style={styles.card}
        // No futuro, ao clicar aqui, abriremos a tela de Edição
        onPress={() => console.log('Editar transação:', item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#E8F5E9' : '#FFEBEE' }]}>
          <MaterialCommunityIcons 
            name={isIncome ? "arrow-top-right" : "arrow-bottom-left"} 
            size={24} 
            color={isIncome ? "#2E7D32" : "#C62828"} 
          />
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.category}>{item.category || 'Geral'}</Text>
        </View>

        <View style={styles.valueContainer}>
          <Text style={[styles.amount, { color: isIncome ? "#2E7D32" : "#C62828" }]}>
            {isIncome ? '+' : '-'} R$ {item.amount.toFixed(2)}
          </Text>
          {/* Formatação provisória de data */}
          <Text style={styles.date}>14 Mar</Text> 
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Extrato</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* FILTROS (CHIPS) */}
      <View style={styles.filterContainer}>
        <FilterChip 
          label="Tudo" 
          isActive={activeFilter === 'tudo'} 
          onPress={() => setActiveFilter('tudo')} 
        />
        <FilterChip 
          label="Entradas" 
          isActive={activeFilter === 'receita'} 
          onPress={() => setActiveFilter('receita')} 
        />
        <FilterChip 
          label="Saídas" 
          isActive={activeFilter === 'despesa'} 
          onPress={() => setActiveFilter('despesa')} 
        />
      </View>

      {/* LISTA OTIMIZADA COM SCROLL INFINITO */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        // Lógica de Scroll Infinito
        onEndReached={loadMoreTransactions}
        onEndReachedThreshold={0.1} // Aciona quando chegar a 10% do fim da lista
        
        // Loading no rodapé da lista
        ListFooterComponent={
          isLoadingMore ? <ActivityIndicator size="small" color={COLORS.primary} style={{ margin: 20 }} /> : null
        }
        
        // Estado Vazio
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="text-box-search-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Componente para os botões de filtro
function FilterChip({ label, isActive, onPress }: any) {
  return (
    <Pressable 
      style={[styles.chip, isActive && styles.chipActive]} 
      onPress={onPress}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingVertical: 15, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backBtn: { padding: 5 },
  
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#FFF',
  },

  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#888',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
  }
});