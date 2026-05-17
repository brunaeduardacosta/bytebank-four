import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Image, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { CheckOnboardingUseCase } from '../../domain/usecases/CheckOnboardingUseCase';
import { userRepository } from '../../infrastructure/repositories/FirestoreUserRepository';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionFormScreen from '../screens/Transactions/TransactionFormScreen';
import ResumoScreen from '../screens/Transactions/ResumoScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import GoalScreen from '../screens/Goals/GoalScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function HomeStack({ initialRouteName }: { initialRouteName: any }) {
  return (
    <Stack.Navigator 
      id="home-stack-navigator" // Adicionado ID obrigatório
      screenOptions={{ headerShown: false }} 
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="TransactionForm" component={TransactionFormScreen} />
      <Stack.Screen name="ResumoFinanceiro" component={ResumoScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Goals" component={GoalScreen} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const { signOut, user } = useAuth();
  const { colors, theme } = useTheme();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.drawerHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          {user?.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Usuário Bytebank'}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={[styles.logoutContainer, { borderTopColor: colors.border }]}>
        <Pressable onPress={signOut} style={styles.logoutBtn}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sair da Conta</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

export default function Routes() {
  const { user, loading, signOut } = useAuth();
  const { colors, theme } = useTheme();
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const [startScreen, setStartScreen] = useState<'Dashboard' | 'Onboarding'>('Dashboard');

  const [isUnlocked, setIsUnlocked] = useState(true);
  const appState = React.useRef(AppState.currentState);
  const backgroundTime = React.useRef<number | null>(null);
  const authTimeout = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        backgroundTime.current = Date.now();
      } else if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (backgroundTime.current) {
          const timeAway = Date.now() - backgroundTime.current;
          if (timeAway > 30000) {
            setIsUnlocked(false);
          }
          backgroundTime.current = null;
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleUnlock = async () => {
    if (isAuthenticating) return;
    
    try {
      setIsAuthenticating(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setIsUnlocked(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para acessar o Bytebank',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsUnlocked(true);
      } else if ('error' in result && result.error === 'lockout') {
        Alert.alert('Bloqueado', 'Muitas tentativas falhas. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.log('Erro na biometria:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (user && !isUnlocked) {
      authTimeout.current = setTimeout(() => {
        handleUnlock();
      }, 500);
    }

    return () => {
      if (authTimeout.current) clearTimeout(authTimeout.current);
    };
  }, [user, isUnlocked]);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (user) {
        try {
          const checkOnboardingUseCase = new CheckOnboardingUseCase(userRepository);
          const hasCompleted = await checkOnboardingUseCase.execute(user.id);
          if (hasCompleted) {
            setStartScreen('Dashboard');
          } else {
            setStartScreen('Onboarding'); 
          }
        } catch {
          setStartScreen('Dashboard');
        } finally {
          setCheckedUserId(user.id);
        }
      }
    }

    if (!loading && user && checkedUserId !== user.id) {
      checkOnboardingStatus();
    }
  }, [user, loading, checkedUserId]);

  if (loading || (user && checkedUserId !== user.id)) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#47A138" />
      </View>
    );
  }

  if (user && !isUnlocked) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="lock-closed" size={64} color={colors.accent} style={{ marginBottom: 20 }} />
        <Text style={{ color: colors.text, fontSize: 20, marginBottom: 30, fontWeight: 'bold' }}>
          App Bloqueado
        </Text>
        <Pressable 
          onPress={handleUnlock}
          style={[styles.unlockBtn, { backgroundColor: colors.accent, marginBottom: 20 }]}
          disabled={isAuthenticating}
        >
          <Text style={styles.unlockBtnText}>
            {isAuthenticating ? 'Aguardando...' : 'Desbloquear'}
          </Text>
        </Pressable>

        <Pressable onPress={signOut} style={{ padding: 10 }}>
          <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Sair da conta</Text>
        </Pressable>
      </View>
    );
  }

  return user ? (
    <Drawer.Navigator
      id="root-drawer-navigator" // Adicionado ID obrigatório
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background },
        drawerActiveBackgroundColor: theme === 'dark' ? 'rgba(71, 161, 56, 0.15)' : '#DCFCE7',
        drawerActiveTintColor: colors.accent,
        drawerInactiveTintColor: colors.text,
      }}
    >
      <Drawer.Screen name="Home" options={{ title: 'Início' }}>
        {(props) => <HomeStack {...props} initialRouteName={startScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Settings" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
    </Drawer.Navigator>
  ) : (
    <Stack.Navigator id="auth-stack-navigator" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  drawerHeader: { padding: 20, marginBottom: 10, borderBottomWidth: 1 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 12 },
  logoutContainer: { marginTop: 'auto', padding: 20, borderTopWidth: 1 },
  logoutBtn: { paddingVertical: 10 },
  logoutText: { fontWeight: 'bold', fontSize: 16 },
  unlockBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 8 },
  unlockBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});