import { Result } from '../../../shared/core/Result';
import { normalizeEmail } from '../../../shared/utils/stringUtils';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEncryptionService } from '../../interfaces/IEncryptionService';
import { IEmailService } from '../../interfaces/IEmailService';
import { IAuthService } from '../../interfaces/IAuthService';

export class ResendVerificationCodeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly encryptionService: IEncryptionService,
    private readonly emailService: IEmailService,
    private readonly authService: IAuthService,
    private readonly verificationCodeTtlMs: number,
  ) {}

  async execute(rawEmail: string): Promise<Result<void>> {
    const email = normalizeEmail(rawEmail);
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.isVerified) {
      return Result.ok();
    }

    const verificationCode = this.authService.generateEmailVerificationCode();
    const verificationCodeHash = await this.encryptionService.hash(verificationCode);
    const verificationCodeExpiresAt = new Date(
      Date.now() + this.verificationCodeTtlMs,
    );

    await this.userRepository.setVerificationCode(
      user.id,
      verificationCodeHash,
      verificationCodeExpiresAt,
    );

    try {
      await this.emailService.sendVerificationCode(
        user.email,
        user.fullName,
        verificationCode,
      );
    } catch {
      return Result.ok();
    }

    return Result.ok();
  }
}
