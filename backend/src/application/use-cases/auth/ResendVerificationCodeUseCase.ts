import { Result } from '../../../shared/core/Result';
import { normalizeEmail } from '../../../shared/utils/stringUtils';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVerificationCodeIssuer } from '../../interfaces/IVerificationCodeIssuer';

export class ResendVerificationCodeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly verificationCodeIssuer: IVerificationCodeIssuer,
  ) {}

  async execute(rawEmail: string): Promise<Result<void>> {
    const email = normalizeEmail(rawEmail);
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.isVerified) {
      return Result.ok();
    }

    await this.verificationCodeIssuer.issue(user, false);

    return Result.ok();
  }
}
