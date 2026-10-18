import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { EMAIL_VERIFICATION_MAX_ATTEMPTS } from '../../../shared/constants/authConstants';
import { normalizeEmail } from '../../../shared/utils/stringUtils';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IVerificationCodeHasher } from '../../interfaces/IVerificationCodeHasher';
import { VerifyEmailRequestDTO } from '../../dtos/auth/VerifyEmailRequestDTO';

export interface VerifyEmailResult {
  userId: string;
  email: string;
  isVerified: boolean;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly codeHasher: IVerificationCodeHasher,
  ) {}

  async execute(dto: VerifyEmailRequestDTO): Promise<Result<VerifyEmailResult>> {
    const email = normalizeEmail(dto.email);

    const user = await this.userRepository.findByEmail(email);

    if (!user || user.isVerified) {
      return Result.fail(this.invalidCodeError());
    }

    const verification = await this.userRepository.getVerificationCode(user.id);

    if (!verification) {
      return Result.fail(this.invalidCodeError());
    }

    if (verification.expiresAt.getTime() <= Date.now()) {
      await this.userRepository.clearVerificationCode(user.id);
      return Result.fail(this.invalidCodeError());
    }

    if (!this.codeHasher.verify(dto.code, verification.codeHash)) {
      const attempts = await this.userRepository.incrementVerificationCodeAttempts(
        user.id,
      );

      if (attempts >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
        await this.userRepository.clearVerificationCode(user.id);
      }

      return Result.fail(this.invalidCodeError());
    }

    const verifiedUser = await this.userRepository.markVerified(user.id);
    await this.userRepository.clearVerificationCode(user.id);

    return Result.ok({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      isVerified: verifiedUser.isVerified,
    });
  }

  private invalidCodeError(): AppError {
    return new AppError(
      'INVALID_VERIFICATION_CODE',
      ErrorMessages.INVALID_VERIFICATION_CODE,
      HttpStatus.BAD_REQUEST,
    );
  }
}
