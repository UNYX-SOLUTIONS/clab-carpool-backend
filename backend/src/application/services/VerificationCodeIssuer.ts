import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAuthService } from '../interfaces/IAuthService';
import { IEmailService } from '../interfaces/IEmailService';
import { IVerificationCodeHasher } from '../interfaces/IVerificationCodeHasher';
import { IVerificationCodeIssuer } from '../interfaces/IVerificationCodeIssuer';

export class VerificationCodeIssuer implements IVerificationCodeIssuer {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly codeHasher: IVerificationCodeHasher,
    private readonly emailService: IEmailService,
    private readonly authService: IAuthService,
    private readonly ttlMs: number,
  ) {}

  async issue(user: User, waitForDelivery = true): Promise<boolean> {
    const code = this.authService.generateEmailVerificationCode();
    const expiresAt = new Date(Date.now() + this.ttlMs);

    await this.userRepository.setVerificationCode(
      user.id,
      this.codeHasher.hash(code),
      expiresAt,
    );

    if (!waitForDelivery) {
      void this.emailService
        .sendVerificationCode(user.email, user.fullName, code)
        .catch(() => undefined);

      return true;
    }

    try {
      await this.emailService.sendVerificationCode(
        user.email,
        user.fullName,
        code,
      );

      return true;
    } catch {
      return false;
    }
  }
}
