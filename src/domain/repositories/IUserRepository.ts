export interface IUserRepository {
  checkOnboardingCompleted(userId: string): Promise<boolean>;
}
