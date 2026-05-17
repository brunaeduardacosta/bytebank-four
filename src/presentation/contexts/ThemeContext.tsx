import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Adicionamos 'danger' na Interface
interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  danger: string; // <-- Adicionado aqui
  modalBg: string; // <-- Adicionado para os modais
}

interface ThemeContextData {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  toggleTheme: () => void;
}

// 2. Adicionamos a cor nos objetos de cores
const lightColors: ThemeColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E2E8F0',
  accent: '#16A34A',
  danger: '#DC2626', // Vermelho para modo claro
  modalBg: 'rgba(0,0,0,0.5)',
};

const darkColors: ThemeColors = {
  background: '#000000', // Preto conforme seu pedido
  card: '#121212',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#27272A',
  accent: '#47A138', // Seu verde característico
  danger: '#EF4444', // Vermelho para modo escuro
  modalBg: 'rgba(255,255,255,0.1)',
};

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isManual, setIsManual] = useState(false);

  // Carrega preferência salva
  useEffect(() => {
    async function loadStoredTheme() {
      const stored = await AsyncStorage.getItem('@bytebank_theme');
      if (stored) {
        setTheme(stored as 'light' | 'dark');
        setIsManual(true);
      } else if (systemColorScheme) {
        setTheme(systemColorScheme);
      }
    }
    loadStoredTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsManual(true);
    await AsyncStorage.setItem('@bytebank_theme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);