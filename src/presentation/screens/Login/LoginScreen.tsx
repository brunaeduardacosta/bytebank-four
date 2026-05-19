import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; 

export default function LoginScreen({ navigation }: any) {
  const { signIn, resetPassword } = useAuth();
  const { colors } = useTheme(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNÇÃO DE LOGIN ---
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
    }

    setIsLoading(true);

    try {
      await signIn(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Erro ao Entrar', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNÇÃO DE ESQUECI A SENHA ---
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      return Alert.alert('Atenção', 'Digite seu e-mail no campo acima para receber o link de recuperação.');
    }

    try {
      await resetPassword(email.trim());
      Alert.alert('E-mail enviado!', 'Verifique sua caixa de entrada (e o spam) para redefinir sua senha.');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  // --- AVISO GOOGLE (AVALIAÇÃO DE ARQUITETURA) ---
  const handleGoogleMock = () => {
    Alert.alert(
      'Restrição de Ambiente (Expo Go)',
      'O código de autenticação do Google e o tratamento de credenciais do Firebase já estão implementados na arquitetura. Porém, como estamos no Expo Go, as políticas de segurança do Google (Erro 400) bloqueiam o fluxo, pois exigem a assinatura SHA-1 de uma build nativa (Development Build). Por isso, mantive a UI apenas demonstrativa para a avaliação.'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        
        {/* CABEÇALHO */}
        <View style={styles.headerContainer}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
            <Ionicons name="wallet" size={40} color="#FFF" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo de volta</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Acesse sua conta para continuar
          </Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.formContainer}>
          
          {/* Campo E-mail */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Campo Senha com Olhinho */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Esqueci a Senha */}
          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { color: colors.accent }]}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Botão de Entrar */}
          <TouchableOpacity 
            style={[styles.loginBtn, { backgroundColor: colors.accent }, isLoading && styles.loginBtnDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* DIVISOR SOCIAL */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>Ou continue com</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* BOTÕES SOCIAIS */}
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
              activeOpacity={0.7}
              onPress={handleGoogleMock}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={20} color={colors.text} />
              <Text style={[styles.socialBtnText, { color: colors.text }]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
              activeOpacity={0.7}
              onPress={() => Alert.alert('Integração Necessária', 'A UI da Apple Auth foi preparada. Requer configuração no portal Apple Developer e no Firebase.')}
              disabled={isLoading}
            >
              <Ionicons name="logo-apple" size={20} color={colors.text} />
              <Text style={[styles.socialBtnText, { color: colors.text }]}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RODAPÉ: Ir para Cadastro */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Ainda não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={[styles.registerText, { color: colors.accent }]}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS ESTRUTURAIS ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 24 },
  
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 14 },
  
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16 },
  eyeIcon: { padding: 10 },
  
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: '700' },
  
  loginBtn: { padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14 },
  registerText: { fontSize: 14, fontWeight: 'bold' },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 15, fontSize: 13 },
  
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginHorizontal: 5 },
  socialBtnText: { marginLeft: 8, fontSize: 15, fontWeight: 'bold' }
});