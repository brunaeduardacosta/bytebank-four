import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform, Animated, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useGoals } from '../context/GoalsContext'; 
import Navbar from '../components/ui/Navbar';
import { styles } from './DashboardScreen.styles'; 
import { useTheme } from '../context/ThemeContext';

const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 110 : 90;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

export default function DashboardScreen({ navigation }: any) {
  const [showValue, setShowValue] = useState(true);
  
  const { user } = useAuth();
  const { balance, transactions } = useTransactions();
  const { goals } = useGoals(); 
  const { theme, colors } = useTheme();
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Usuário';

  const { totalReceitas, totalDespesas } = useMemo(() => {
    const r = transactions.filter(t => t.type?.toLowerCase() === 'receita').reduce((acc, curr) => acc + curr.amount, 0);
    const d = transactions.filter(t => t.type?.toLowerCase() === 'despesa').reduce((acc, curr) => acc + curr.amount, 0);
    return { totalReceitas: r, totalDespesas: d };
  }, [transactions]);

  const transacoesRecentes = transactions.slice(0, 4);

const formatCurrency = (value: number | undefined | null) => {
  const safeValue = value ?? 0; 
  return safeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const principalGoal = useMemo(() => {
    if (!goals || goals.length === 0) return null;
    // Tenta encontrar a meta fixada (estrela), se não houver, pega a primeira da lista
    return goals.find(g => g.isPinned) || goals[0];
  }, [goals]);

  // 🚀 Usando 'current' e 'target' (os novos nomes padronizados)
  const progressoDecimal = principalGoal && principalGoal.target > 0 
    ? Math.min(principalGoal.current / principalGoal.target, 1) : 0;
    
  const progressoPorcentagem = (progressoDecimal * 100).toFixed(0);
  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: progressoDecimal,
      duration: 1500,
      useNativeDriver: false, 
    }).start();
  }, [progressoDecimal]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      <Navbar theme={{ 
        card: colors.card, 
        border: colors.border, 
        text: colors.text, 
        accent: colors.accent, 
        subText: colors.textSecondary 
      }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          paddingTop: NAVBAR_HEIGHT + 20,
          paddingBottom: 40,
          alignItems: 'center' // Centraliza o conteúdo no Web
        }}
      >
        <View style={{ 
          width: '100%', 
          maxWidth: 800, // Limite para telas de PC
          paddingHorizontal: IS_WEB ? 40 : 0 // Espaço lateral no Web
        }}>
          
          <View style={[styles.welcomeSection, { paddingHorizontal: IS_WEB ? 0 : 20 }]}>
            <Text style={[styles.greeting, { color: colors.text }]}>Visão Geral</Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>{`Bem-vindo(a) • ${firstName}`}</Text>
          </View>

          <View style={{ 
            backgroundColor: colors.card, 
            marginHorizontal: IS_WEB ? 0 : 20, 
            marginBottom: 25, 
            borderRadius: 24, 
            padding: 30,
            borderWidth: 1, 
            borderColor: colors.border,
            elevation: 4
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '600' }}>Saldo Total</Text>
              <TouchableOpacity onPress={() => setShowValue(!showValue)} style={{ padding: 8 }}>
                <Ionicons name={showValue ? 'eye-outline' : 'eye-off-outline'} size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={{ fontSize: SCREEN_WIDTH < 400 ? 32 : 42, fontWeight: '900', color: colors.text, marginBottom: 25, letterSpacing: -1 }}>
              {showValue ? formatCurrency(balance) : 'R$ ••••••'}
            </Text>

            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 25 }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(22, 163, 74, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="arrow-up" size={22} color="#16A34A" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>Receitas</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#16A34A' }}>
                    {showValue ? formatCurrency(totalReceitas) : '••••'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(220, 38, 38, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="arrow-down" size={22} color="#DC2626" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>Despesas</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#DC2626' }}>
                    {showValue ? formatCurrency(totalDespesas) : '••••'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {principalGoal && (
            <View style={{ 
              backgroundColor: colors.card, 
              marginHorizontal: IS_WEB ? 0 : 20, 
              marginBottom: 25, 
              padding: 20, 
              borderRadius: 20, 
              borderWidth: 1, 
              borderColor: colors.border 
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="star" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                  <Text style={{ fontWeight: 'bold', color: colors.text, fontSize: 16 }}>{principalGoal.title}</Text>
                </View>
                <Text style={{ fontWeight: 'bold', fontSize: 14, color: principalGoal.color }}>
                  {`${progressoPorcentagem}%`}
                </Text>
              </View>
              <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: 'hidden', marginBottom: 10 }}>
                <Animated.View style={{ height: '100%', backgroundColor: principalGoal.color, width: progressWidth }} />
              </View>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
    {`Guardado: ${formatCurrency(principalGoal.current)}`}
  </Text>
    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
    {`Meta: ${formatCurrency(principalGoal.target)}`}
  </Text>
</View>
            </View>
          )}

          <View style={[styles.quickActionsContainer, { paddingHorizontal: IS_WEB ? 0 : 20 }]}>
            <QuickAction icon="plus" label="Receita" color="#16A34A" bgColor="rgba(22, 163, 74, 0.15)" textColor={colors.text} onPress={() => navigation.navigate('TransactionForm', { type: 'receita' })} />
            <QuickAction icon="minus" label="Despesa" color="#DC2626" bgColor="rgba(220, 38, 38, 0.15)" textColor={colors.text} onPress={() => navigation.navigate('TransactionForm', { type: 'despesa' })} />
            <QuickAction icon="bullseye-arrow" label="Metas" color={colors.accent} bgColor={theme === 'dark' ? 'rgba(71, 161, 56, 0.15)' : '#DCFCE7'} textColor={colors.text} onPress={() => navigation.navigate('Goals')} />
            <QuickAction icon="chart-pie" label="Relatórios" color={colors.accent} bgColor={theme === 'dark' ? 'rgba(71, 161, 56, 0.15)' : '#DCFCE7'} textColor={colors.text} onPress={() => navigation.navigate('ResumoFinanceiro')} />
          </View>

          <View style={[styles.recentSection, { paddingHorizontal: IS_WEB ? 0 : 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Atividade Recente</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Statement')}>
                <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 15 }}>Ver tudo</Text>
              </TouchableOpacity>
            </View>
            
            {transacoesRecentes.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Nenhuma transação encontrada.</Text>
              </View>
            ) : (
              transacoesRecentes.map((item, index) => {
                const isR = item.type?.toLowerCase() === 'receita';
                return (
                  <View key={index} style={{ 
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
                    padding: 16, borderRadius: 18, marginBottom: 12, 
                    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border 
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: isR ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                        <MaterialCommunityIcons name={isR ? 'cash-plus' : 'shopping-outline'} size={24} color={isR ? '#16A34A' : '#DC2626'} />
                      </View>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 2 }}>{item.description}</Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.date instanceof Date ? item.date.toLocaleDateString('pt-BR') : 'Hoje'}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: isR ? '#16A34A' : colors.text }}>
                      {`${isR ? '+' : '-'} ${formatCurrency(item.amount)}`}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, color, bgColor, textColor, onPress }: any) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <TouchableOpacity 
        style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }} 
        activeOpacity={0.7} 
        onPress={onPress}
      >
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </TouchableOpacity>
      <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>{label}</Text>
    </View>
  );
}