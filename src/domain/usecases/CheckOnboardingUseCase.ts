import { IUserRepository } from '../repositories/IUserRepository';

export class CheckOnboardingUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<boolean> {
    return this.userRepository.checkOnboardingCompleted(userId);
  }
}
