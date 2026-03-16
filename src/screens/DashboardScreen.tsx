import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform, Animated } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { useGoals } from "../context/GoalsContext"; 
import Navbar from "../components/ui/Navbar";
import { styles } from './DashboardScreen.styles'; 

const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

export default function DashboardScreen({ navigation }: any) {
  const [showValue, setShowValue] = useState(true);
  
  const { user } = useAuth();
  const { balance, transactions } = useTransactions();
  const { goals } = useGoals(); 
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Arthur';

  // Lógica das Receitas e Despesas
  const { totalReceitas, totalDespesas } = useMemo(() => {
    const receitas = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    const despesas = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    return { totalReceitas: receitas, totalDespesas: despesas };
  }, [transactions]);

  const transacoesRecentes = transactions.slice(0, 4);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // --- LÓGICA DA META FIXADA (FAVORITA) ---
  const principalGoal = useMemo(() => {
    if (!goals || goals.length === 0) return null;
    // Procura a meta favoritada. Se não achar nenhuma, pega a primeira da lista.
    return goals.find(g => g.isPinned) || goals[0];
  }, [goals]);

  const progressoDecimal = principalGoal && principalGoal.targetAmount > 0 
    ? Math.min(principalGoal.currentAmount / principalGoal.targetAmount, 1) 
    : 0;
  const progressoPorcentagem = (progressoDecimal * 100).toFixed(0);

  // Animação da barra de progresso
  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: progressoDecimal,
      duration: 1500,
      useNativeDriver: false, 
    }).start();
  }, [progressoDecimal, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Navbar theme={{ card: '#FFF', border: '#E2E8F0', text: '#1F2937', accent: '#47A138', subText: '#6B7280' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: NAVBAR_HEIGHT + 20 }]}>
        
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Visão Geral</Text>
          <Text style={styles.subGreeting}>{`Março de 2026 • ${firstName}`}</Text>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <View style={styles.rowCenter}>
            <Text style={styles.balanceValue}>{showValue ? formatCurrency(balance) : "R$ ••••••"}</Text>
            <TouchableOpacity onPress={() => setShowValue(!showValue)} style={{ marginLeft: 15 }}>
              <Ionicons name={showValue ? "eye-outline" : "eye-off-outline"} size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { borderColor: '#E2E8F0' }]}>
            <View style={[styles.iconArea, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="arrow-up" size={20} color="#16A34A" />
            </View>
            <Text style={styles.summaryTitle}>Receitas</Text>
            <Text style={[styles.summaryAmount, { color: '#16A34A' }]}>{showValue ? formatCurrency(totalReceitas) : "••••••"}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#E2E8F0' }]}>
            <View style={[styles.iconArea, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="arrow-down" size={20} color="#DC2626" />
            </View>
            <Text style={styles.summaryTitle}>Despesas</Text>
            <Text style={[styles.summaryAmount, { color: '#DC2626' }]}>{showValue ? formatCurrency(totalDespesas) : "••••••"}</Text>
          </View>
        </View>

        {/* CARD DA META FAVORITA */}
        {principalGoal && (
          <View style={[styles.summaryCard, { marginHorizontal: 20, marginBottom: 25, borderColor: '#E2E8F0' }]}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>{principalGoal.title}</Text>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: principalGoal.color }}>
                {progressoPorcentagem}%
              </Text>
            </View>
            
            <View style={{ height: 10, borderRadius: 5, marginVertical: 14, backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', borderRadius: 5, backgroundColor: principalGoal.color, width: progressWidth }} />
            </View>
            
            <View style={styles.rowBetween}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280' }}>Guardado: {formatCurrency(principalGoal.currentAmount)}</Text>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#6B7280' }}>Alvo: {formatCurrency(principalGoal.targetAmount)}</Text>
            </View>
          </View>
        )}

        <View style={styles.quickActionsContainer}>
          <QuickAction icon="plus" label="Receita" color="#16A34A" onPress={() => navigation.navigate('TransactionForm', { type: 'receita' })} />
          <QuickAction icon="minus" label="Despesa" color="#DC2626" onPress={() => navigation.navigate('TransactionForm', { type: 'despesa' })} />
          <QuickAction icon="bullseye-arrow" label="Metas" color="#47A138" onPress={() => navigation.navigate('Goals')} />
          <QuickAction icon="chart-pie" label="Relatórios" color="#47A138" onPress={() => navigation.navigate('ResumoFinanceiro')} />
        </View>

        <View style={styles.recentSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Atividade Recente</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Statement')}>
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          {transacoesRecentes.length === 0 ? (
            <View style={{ padding: 30, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Text style={{ color: '#94A3B8', fontWeight: '500' }}>Nenhuma transação este mês.</Text>
            </View>
          ) : (
            transacoesRecentes.map((item, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.catIcon, { backgroundColor: item.type === 'receita' ? '#DCFCE7' : '#F1F5F9' }]}>
                    <MaterialCommunityIcons name={item.type === 'receita' ? "cash-plus" : "shopping-outline"} size={24} color={item.type === 'receita' ? '#16A34A' : '#6B7280'} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 }}>{item.description}</Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>{item.date instanceof Date ? item.date.toLocaleDateString('pt-BR') : (item.date ? String(item.date) : 'Hoje')}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: item.type === 'receita' ? '#16A34A' : '#1F2937' }}>{`${item.type === 'receita' ? '+' : '-'} ${formatCurrency(item.amount)}`}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: any) {
  return (
    <View style={styles.actionItem}>
      <TouchableOpacity style={styles.actionCircle} activeOpacity={0.6} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </TouchableOpacity>
      <Text style={styles.actionText}>{label}</Text>
    </View>
  );
}