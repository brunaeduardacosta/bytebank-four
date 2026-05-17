import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class FirestoreUserRepository implements IUserRepository {
  async checkOnboardingCompleted(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().onboardingCompleted) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const userRepository = new FirestoreUserRepository();
