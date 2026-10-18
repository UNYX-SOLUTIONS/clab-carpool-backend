import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { normalizeEmail } from '../../../shared/utils/stringUtils';
import { UserNotFoundException } from '../../../domain/exceptions/UserNotFoundException';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEncryptionService } from '../../interfaces/IEncryptionService';
import { VerifyEmailRequestDTO } from '../../dtos/auth/VerifyEmailRequestDTO';

export interface VerifyEmailResult {
  userId: string;
  email: string;
  isVerified: boolean;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(dto: VerifyEmailRequestDTO): Promise<Result<VerifyEmailResult>> {
    const email = normalizeEmail(dto.email);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return Result.fail(new UserNotFoundException());
    }

    if (user.isVerified) {
      return Result.fail(
        new AppError(
          'ALREADY_VERIFIED',
          'El correo ya fue verificado',
          HttpStatus.CONFLICT,
        ),
      );
    }

    const verification = await this.userRepository.getVerificationCode(user.id);

    if (!verification) {
      return Result.fail(this.invalidCodeError());
    }

    if (verification.expiresAt.getTime() <= Date.now()) {
      await this.userRepository.clearVerificationCode(user.id);
      return Result.fail(this.invalidCodeError());
    }

    const codeMatches = await this.encryptionService.compare(
      dto.code,
      verification.codeHash,
    );

    if (!codeMatches) {
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
