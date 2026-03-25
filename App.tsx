import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
// 1. Importe o Provider do Safe Area
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Routes from './src/navigation/Routes';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TransactionProvider } from './src/context/TransactionContext';
import { GoalsProvider } from './src/context/GoalsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Correção para Web/iOS
if (Platform.OS === 'ios' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    [aria-hidden="true"] {
      pointer-events: none;
      user-select: none;
    }
  `;
  document.head.append(style);
}

function AppContent() {
  const { loading } = useAuth();
  const { colors, theme } = useTheme();
  
  const MyNavTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyNavTheme}>
      <Routes />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          {/* 2. Envolva tudo com o SafeAreaProvider */}
          <SafeAreaProvider>
            <TransactionProvider>
              <GoalsProvider>
                <AppContent />
              </GoalsProvider>
            </TransactionProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}