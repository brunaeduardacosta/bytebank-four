import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../infrastructure/firebase/firebase'; 
import { useTheme } from '../contexts/ThemeContext';

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
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Usuário';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.drawerHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.displayName || 'Usuário Bytebank'}</Text>
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
  const { user, loading } = useAuth();
  const { colors, theme } = useTheme();
  const [isCheckingBoarding, setIsCheckingBoarding] = useState(true);
  const [startScreen, setStartScreen] = useState<'Dashboard' | 'Onboarding'>('Dashboard');

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists() && docSnap.data().onboardingCompleted) {
            setStartScreen('Dashboard');
          } else {
            setStartScreen('Onboarding'); 
          }
        } catch {
          setStartScreen('Dashboard');
        }
      }
      setIsCheckingBoarding(false); 
    }

    if (!loading) {
      if (user) { checkOnboardingStatus(); } 
      else { setIsCheckingBoarding(false); }
    }
  }, [user, loading]);

  if (loading || isCheckingBoarding) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#47A138" />
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
  logoutText: { fontWeight: 'bold', fontSize: 16 }
});