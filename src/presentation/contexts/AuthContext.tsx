import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserEntity } from '../../domain/entities/UserEntity';
import { AuthUseCases } from '../../domain/usecases/AuthUseCases';
import { authRepository } from '../../infrastructure/repositories/FirebaseAuthRepository';

// Instância do UseCase injetando a implementação de infraestrutura
const authUseCases = new AuthUseCases(authRepository);

interface AuthContextData {
  user: UserEntity | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authUseCases.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, senha: string) => {
    await authUseCases.signIn(email, senha);
  };

  const signUp = async (nome: string, email: string, senha: string) => {
    await authUseCases.signUp(nome, email, senha);
  };

  const resetPassword = async (email: string) => {
    await authUseCases.resetPassword(email);
  };

  const signOut = async () => {
    await authUseCases.signOut();
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