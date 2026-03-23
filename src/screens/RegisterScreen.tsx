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

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados de UX
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 FUNÇÃO DE REGISTRO CORRIGIDA
  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      return Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
    }

    if (senha.length < 6) {
      return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    }

    setIsLoading(true);

    try {
      await signUp(nome.trim(), email.trim(), senha);

      // 🔥 REDIRECIONA PARA ONBOARDING E REMOVE HISTÓRICO
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });

    } catch (error: any) {
      Alert.alert('Erro ao Criar Conta', error.message);
    } finally {
      setIsLoading(false);
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
            <Ionicons name="person-add" size={36} color="#FFF" />
          </View>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Comece a organizar a sua vida financeira</Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.formContainer}>
          
          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Como quer ser chamado?</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Seu nome ou apelido"
                autoCapitalize="words"
                value={nome}
                onChangeText={setNome}
              />
            </View>
          </View>

          {/* Email */}
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

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="No mínimo 6 caracteres"
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
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

          {/* Botão */}
          <TouchableOpacity 
            style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
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
          <Text style={styles.footerText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Entrar</Text>
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
  iconContainer: { 
    width: 72, 
    height: 72, 
    backgroundColor: '#47A138', 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    elevation: 4 
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#374151', 
    marginBottom: 8, 
    textTransform: 'uppercase' 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    paddingHorizontal: 15 
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#1F2937' },
  eyeIcon: { padding: 10 },
  
  registerBtn: { 
    backgroundColor: '#47A138', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 2, 
    marginTop: 10 
  },
  registerBtnDisabled: { opacity: 0.7 },
  registerBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#6B7280', fontSize: 14 },
  loginText: { color: '#47A138', fontSize: 14, fontWeight: 'bold' }
});