import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
// NOVA IMPORTAÇÃO
import { LinearGradient } from 'expo-linear-gradient'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';


const { width, height } = Dimensions.get('window');

// Garanta que estas cores reflitam a Bytebank no seu arquivo theme.ts real
const COLORS = {
  primary: '#013D2D',      // Verde Escuro Bytebank Real
  primaryLight: '#015C44', // Variante para o gradiente
  accent: '#47A138',       // Verde Brilhante
  white: '#FFFFFF',
  textSecondary: '#C1C7CD',
  safe: '#4ADE80'          // Verde Segurança
};

export default function WelcomeScreen({ navigation }: any) {
  const { user } = useAuth();
  
  // Pega o primeiro nome, ou Arthur como padrão se o displayName falhar
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Arthur';

  useEffect(() => {
    // Temporizador de 2.8 segundos para dar tempo de apreciar o novo visual
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    // 1. FUNDO COM GRADIENTE PREMIUM
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryLight]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 2. ÍCONES DE FUNDO (MARCA D'ÁGUA SUTIL) */}
      <View style={styles.backgroundIconsContainer}>
        <MaterialCommunityIcons name="currency-usd" size={100} color="rgba(255,255,255,0.03)" style={styles.bgIcon1} />
        <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={150} color="rgba(255,255,255,0.02)" style={styles.bgIcon2} />
        <MaterialCommunityIcons name="security" size={120} color="rgba(255,255,255,0.03)" style={styles.bgIcon3} />
      </View>

      <View style={styles.content}>
        {/* 3. ÍCONE DE LOGO ESTILIZADO (SHIELD SECURITY) */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[COLORS.accent, '#357D29']}
            style={styles.logoCircle}
          >
            <MaterialCommunityIcons name="shield-check" size={40} color={COLORS.primary} />
          </LinearGradient>
          {/* Brilho ao redor do logo */}
          <View style={styles.logoGlow} />
        </View>
        
        {/* TEXTOS COM NOVA HIERARQUIA */}
        <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
        <Text style={styles.nameText}>{firstName}!</Text>
        
        {/* CARD DE CARREGAMENTO SEGURO */}
        <View style={styles.loadingCard}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.safe} style={{marginRight: 10}} />
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.loadingText}>Verificando ambiente seguro...</Text>
        </View>
      </View>

      {/* RODAPÉ DISCRETO */}
      <View style={styles.footer}>
         <Text style={styles.footerText}>Tecnologia Bytebank © 2024</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 10, paddingHorizontal: 30 },
  
  // Estilos da Marca d'Água sutil
  backgroundIconsContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  bgIcon1: { position: 'absolute', top: 80, left: -20, transform: [{ rotate: '-15deg' }] },
  bgIcon2: { position: 'absolute', bottom: -30, right: -40, transform: [{ rotate: '10deg' }] },
  bgIcon3: { position: 'absolute', top: '45%', right: 30, transform: [{ rotate: '5deg' }] },

  // Estilos do Logo e Brilho
  logoContainer: { position: 'relative', marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  logoCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8, zIndex: 5 },
  logoGlow: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.accent, opacity: 0.15, zIndex: 1 },

  // Textos
  welcomeText: { fontSize: 18, color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  nameText: { fontSize: 38, fontWeight: '900', color: COLORS.white, marginBottom: 60, letterSpacing: -1, textAlign: 'center' },
  
  // Card de Carregamento
  loadingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  loadingText: { color: COLORS.accent, marginLeft: 10, fontSize: 14, fontWeight: '600' },

  // Rodapé
  footer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }
});