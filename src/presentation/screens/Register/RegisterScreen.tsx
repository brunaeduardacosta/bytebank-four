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
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const { colors } = useTheme(); 
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados de UX
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 FUNÇÃO DE REGISTRO CORRIGIDA (Deixando o Routes.tsx cuidar da navegação)
  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      return Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
    }

    if (senha.length < 6) {
      return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    }

    setIsLoading(true);

    try {
      // O signUp fará o cadastro e o login automático.
      // Imediatamente o onAuthStateChanged (no AuthContext) vai disparar.
      // O Routes.tsx vai perceber o usuário, checar o Firestore, e abrir o Onboarding sozinho!
      await signUp(nome.trim(), email.trim(), senha);

    } catch (error: any) {
      Alert.alert('Erro ao Criar Conta', error.message);
    } finally {
      // Se der sucesso, a tela será desmontada antes de chegar aqui. 
      // Se der erro, o botão volta ao normal.
      setIsLoading(false);
    }
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
            <Ionicons name="person-add" size={32} color="#FFF" style={{ marginLeft: 4 }} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Comece a organizar a sua vida financeira</Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.formContainer}>
          
          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Como quer ser chamado?</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Seu nome ou apelido"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                value={nome}
                onChangeText={setNome}
              />
            </View>
          </View>

          {/* Email */}
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

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="No mínimo 6 caracteres"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
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

          {/* Botão */}
          <TouchableOpacity 
            style={[styles.registerBtn, { backgroundColor: colors.accent }, isLoading && styles.registerBtnDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.registerBtnText}>Criar minha conta</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={[styles.loginText, { color: colors.accent }]}>Entrar</Text>
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
  iconContainer: { 
    width: 72, 
    height: 72, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    elevation: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8
  },
  title: { fontSize: 26, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 14 },
  
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { 
    fontSize: 12, 
    fontWeight: '800', 
    marginBottom: 8, 
    textTransform: 'uppercase',
    letterSpacing: 0.5 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: 16, 
    paddingHorizontal: 15 
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16 },
  eyeIcon: { padding: 10 },
  
  registerBtn: { 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 2, 
    marginTop: 10,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },
  registerBtnDisabled: { opacity: 0.7 },
  registerBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14 },
  loginText: { fontSize: 14, fontWeight: 'bold' }
});