import { IAuthRepository } from '../repositories/IAuthRepository';
import { UserEntity } from '../entities/UserEntity';

export class AuthUseCases {
  constructor(private authRepository: IAuthRepository) {}

  async signIn(email: string, senha: string): Promise<void> {
    return this.authRepository.signIn(email, senha);
  }

  async signUp(nome: string, email: string, senha: string): Promise<void> {
    return this.authRepository.signUp(nome, email, senha);
  }

  async signOut(): Promise<void> {
    return this.authRepository.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    return this.authRepository.resetPassword(email);
  }

  onAuthStateChanged(callback: (user: UserEntity | null) => void): () => void {
    return this.authRepository.onAuthStateChanged(callback);
  }
}
