import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { UserEntity } from '../../domain/entities/UserEntity';

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

const mapFirebaseUserToEntity = (user: User): UserEntity => {
  return {
    id: user.uid,
    name: user.displayName || 'Usuário',
    email: user.email || '',
    photoUrl: user.photoURL || undefined
  };
};

export class FirebaseAuthRepository implements IAuthRepository {
  async signIn(email: string, senha: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error: any) {
      throw new Error(translateFirebaseError(error.code));
    }
  }

  async signUp(nome: string, email: string, senha: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: nome });
        await userCredential.user.reload();
      }
    } catch (error: any) {
      throw new Error(translateFirebaseError(error.code));
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(translateFirebaseError(error.code));
    }
  }

  onAuthStateChanged(callback: (user: UserEntity | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        callback(mapFirebaseUserToEntity(currentUser));
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  }
}

export const authRepository = new FirebaseAuthRepository();
