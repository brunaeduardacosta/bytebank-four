import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../../../shared/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' // Fundo clean para gestão financeira
  },
  scrollContent: { 
    paddingBottom: 40 
  },
  
  // --- CABEÇALHO ---
  welcomeSection: { 
    paddingHorizontal: SPACING.m, 
    marginBottom: 20 
  },
  greeting: { 
    fontSize: 26, 
    fontWeight: "800", 
    color: '#1F2937',
    letterSpacing: -0.5 
  },
  subGreeting: { 
    fontSize: 14, 
    marginTop: 4, 
    color: '#6B7280',
    fontWeight: '500'
  },

  // --- SALDO ATUAL ---
  balanceSection: { 
    paddingHorizontal: SPACING.m, 
    marginBottom: 25 
  },
  balanceLabel: { 
    fontSize: 13, 
    color: '#6B7280', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    fontWeight: '600',
    marginBottom: 4 
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  balanceValue: { 
    fontSize: 38, 
    fontWeight: '900', 
    color: COLORS.primary, 
    letterSpacing: -1 
  },

  // --- RESUMO MENSAL (CARDS LADO A LADO) ---
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    marginBottom: 25,
    gap: 12
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconArea: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  summaryTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // --- AÇÕES RÁPIDAS (ADICIONAR RECEITA/DESPESA) ---
  quickActionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 30 
  },
  actionItem: { 
    alignItems: 'center', 
    width: (width - 40) / 4.5 
  },
  actionCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 20, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8,
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  actionText: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#4B5563', 
    textAlign: 'center' 
  },

  // --- ATIVIDADE RECENTE ---
  recentSection: {
    paddingHorizontal: SPACING.m,
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600'
  },
  
  // ITENS DA LISTA
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  catIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  transactionDesc: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2
  },
  transactionDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500'
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyStateText: {
    color: '#94A3B8',
    fontWeight: '500'
  }
});