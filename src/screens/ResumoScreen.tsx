import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/ui/Navbar';

// 1. IMPORTANDO O CONTEXTO
import { useTransactions } from '../context/TransactionContext';

const { width } = Dimensions.get('window');

const Themes = {
  light: { bg: "#F8FAFC", card: "#FFFFFF", text: "#1F2937", subText: "#6B7280", border: "#E2E8F0", accent: "#47A138", tab: "#F1F5F9" },
  dark: { bg: "#0F172A", card: "#1E293B", text: "#F8FAFC", subText: "#94A3B8", border: "#334155", accent: "#4ADE80", tab: "#334155" }
};

export default function ResumoScreen({ navigation }: any) {
  const [isDarkMode] = useState(false); 
  const theme = isDarkMode ? Themes.dark : Themes.light;
  const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

  // 2. PUXANDO DADOS DO FIREBASE
  const { transactions } = useTransactions();

  // 3. CALCULANDO OS TOTAIS REAIS
  const { totalReceitas, totalDespesas } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'receita') acc.totalReceitas += curr.amount;
        if (curr.type === 'despesa') acc.totalDespesas += curr.amount;
        return acc;
      },
      { totalReceitas: 0, totalDespesas: 0 }
    );
  }, [transactions]);

  // 4. LÓGICA DA ALTURA DAS BARRAS (Altura máxima de 140px)
  const maxAmount = Math.max(totalReceitas, totalDespesas, 1); // Evita divisão por zero
  const alturaReceita = (totalReceitas / maxAmount) * 140;
  const alturaDespesa = (totalDespesas / maxAmount) * 140;

  // Formatação
  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const currentMonthName = new Date().toLocaleString('pt-BR', { month: 'long' });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      <Navbar theme={theme} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingTop: NAVBAR_HEIGHT + 20 }]}
      >
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Voltar para o início</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Resumo Financeiro</Text>
          <Text style={[styles.pageSubTitle, { color: theme.subText }]}>
            Análise de gastos de {currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)}
          </Text>
        </View>

        {/* GRÁFICO DINÂMICO */}
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Entradas vs Saídas</Text>
          
          <View style={styles.chartContainer}>
            {/* Barra de Entradas Dinâmica */}
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: alturaReceita || 10, backgroundColor: theme.accent }]} />
              <Text style={[styles.barLabel, { color: theme.subText }]}>Receitas</Text>
              <Text style={[styles.barValue, { color: theme.text }]}>{formatCurrency(totalReceitas)}</Text>
            </View>

            {/* Barra de Saídas Dinâmica */}
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: alturaDespesa || 10, backgroundColor: "#EF4444" }]} />
              <Text style={[styles.barLabel, { color: theme.subText }]}>Gastos</Text>
              <Text style={[styles.barValue, { color: theme.text }]}>{formatCurrency(totalDespesas)}</Text>
            </View>
          </View>
        </View>

        {/* LISTA DE TRANSAÇÕES REAIS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Transações Recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Statement')}>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subText, marginTop: 20 }}>
            Nenhuma transação registrada ainda.
          </Text>
        ) : (
          // Pega apenas as 5 transações mais recentes
          transactions.slice(0, 5).map((t) => (
            <TransactionItem 
              key={t.id}
              icon={t.type === 'receita' ? "arrow-up-circle-outline" : "cart-outline"} 
              title={t.description} 
              date={t.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} 
              value={`${t.type === 'receita' ? '+' : '-'} ${formatCurrency(t.amount)}`} 
              theme={theme} 
              isNegative={t.type === 'despesa'} 
            />
          ))
        )}

      </ScrollView>
    </View>
  );
}

// Sub-componente inalterado
function TransactionItem({ icon, title, date, value, theme, isNegative }: any) {
  return (
    <View style={[styles.tItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.tIconContainer, { backgroundColor: theme.tab }]}>
        <Ionicons name={icon} size={22} color={isNegative ? "#EF4444" : theme.accent} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.tTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.tDate, { color: theme.subText }]}>{date}</Text>
      </View>
      <Text style={[styles.tValue, { color: isNegative ? "#EF4444" : theme.accent }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { marginLeft: 8, fontWeight: '600', fontSize: 16 },
  headerSection: { marginBottom: 25 },
  pageTitle: { fontSize: 26, fontWeight: '900' },
  pageSubTitle: { fontSize: 14, marginTop: 4 },
  
  chartCard: { padding: 20, borderRadius: 28, borderWidth: 1, marginBottom: 30 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 200, paddingBottom: 10 },
  barGroup: { alignItems: 'center' },
  bar: { width: 50, borderRadius: 15, marginBottom: 12 },
  barLabel: { fontSize: 12, fontWeight: '600' },
  barValue: { fontSize: 14, fontWeight: '800', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  tItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1 },
  tIconContainer: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  tTitle: { fontSize: 15, fontWeight: '700' },
  tDate: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  tValue: { fontSize: 16, fontWeight: '800' }
});