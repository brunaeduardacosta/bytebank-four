import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../services/firebase';

// --- INTERFACES ---
interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// --- FUNÇÃO TRADUTORA DE ERROS DO FIREBASE ---
const translateFirebaseError = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/user-disabled':
      return 'Este usuário foi desativado.';
    case 'auth/user-not-found':
      return 'Não encontramos uma conta com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado em outra conta.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas falhas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
};

// --- PROVIDER ---
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. ESCUTA DE AUTENTICAÇÃO (Verifica se o usuário já estava logado)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Só libera a tela depois de checar o login
    });

    return () => unsubscribe();
  }, []);

  // 2. FUNÇÃO DE LOGIN
  const signIn = async (email: string, senha: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error: any) {
      // Lança o erro traduzido para a tela mostrar ao usuário
      throw new Error(translateFirebaseError(error.code));
    }
  };

  // 3. FUNÇÃO DE CADASTRO (Agora aceita e salva o Nome!)
  const signUp = async (nome: string, email: string, senha: string) => {
    try {
      // Cria a conta no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      
      // Atualiza o perfil do usuário recém-criado colocando o NOME dele
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: nome
        });
        
        // Atualizamos o estado local para refletir o nome na hora
        setUser({ ...userCredential.user, displayName: nome } as User);
      }
    } catch (error: any) {
      throw new Error(translateFirebaseError(error.code));
    }
  };

  // 4. FUNÇÃO DE RECUPERAR SENHA
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(translateFirebaseError(error.code));
    }
  };

  // 5. FUNÇÃO DE SAIR (LOGOUT)
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);