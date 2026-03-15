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
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  // Puxando as funções do nosso "Cérebro"
  const { signIn, resetPassword } = useAuth();
  
  // Estados da tela
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de UX (Experiência do Usuário)
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNÇÃO DE LOGIN ---
  const handleLogin = async () => {
    // 1. Validação básica antes de chamar o banco
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
    }

    setIsLoading(true); // Liga o "girando" no botão

    try {
      // Tenta fazer o login no Firebase
      await signIn(email.trim(), password);
      // Se der certo, o onAuthStateChanged do App.tsx/Routes.tsx vai trocar a tela sozinho!
    } catch (error: any) {
      // AQUI ESTÁ A MÁGICA! Pega a mensagem traduzida do AuthContext e joga na tela
      Alert.alert('Erro ao Entrar', error.message);
    } finally {
      setIsLoading(false); // Desliga o "girando" do botão dando certo ou errado
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        
        {/* CABEÇALHO */}
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={40} color="#FFF" />
          </View>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.formContainer}>
          
          {/* Campo E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Campo Senha com Olhinho */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={!showPassword} // Controlado pelo estado
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Esqueci a Senha */}
          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Botão de Entrar */}
          <TouchableOpacity 
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]} 
            onPress={handleLogin}
            disabled={isLoading} // Desativa o botão se estiver carregando
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* RODAPÉ: Ir para Cadastro */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 24 },
  
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 72, height: 72, backgroundColor: '#47A138', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4 },
  title: { fontSize: 26, fontWeight: '900', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#1F2937' },
  eyeIcon: { padding: 10 },
  
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#47A138', fontSize: 14, fontWeight: '600' },
  
  loginBtn: { backgroundColor: '#47A138', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#6B7280', fontSize: 14 },
  registerText: { color: '#47A138', fontSize: 14, fontWeight: 'bold' }
});