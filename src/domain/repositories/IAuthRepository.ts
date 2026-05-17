import { UserEntity } from '../entities/UserEntity';

export interface IAuthRepository {
  signIn(email: string, senha: string): Promise<void>;
  signUp(nome: string, email: string, senha: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  onAuthStateChanged(callback: (user: UserEntity | null) => void): () => void;
}
