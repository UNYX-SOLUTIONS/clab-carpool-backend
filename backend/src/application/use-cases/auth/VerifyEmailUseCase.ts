import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { normalizeEmail } from '../../../shared/utils/stringUtils';
import { UserNotFoundException } from '../../../domain/exceptions/UserNotFoundException';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IAuthService } from '../../interfaces/IAuthService';
import { VerifyEmailRequestDTO } from '../../dtos/auth/VerifyEmailRequestDTO';

export interface VerifyEmailResult {
  userId: string;
  email: string;
  isVerified: boolean;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(dto: VerifyEmailRequestDTO): Promise<Result<VerifyEmailResult>> {
    const email = normalizeEmail(dto.email);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return Result.fail(new UserNotFoundException());
    }

    let payload;
    try {
      payload = this.authService.verifyEmailVerificationCode(dto.code);
    } catch {
      return Result.fail(
        new AppError(
          'INVALID_VERIFICATION_CODE',
          ErrorMessages.INVALID_VERIFICATION_CODE,
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    if (payload.email !== email) {
      return Result.fail(
        new AppError(
          'INVALID_VERIFICATION_CODE',
          ErrorMessages.INVALID_VERIFICATION_CODE,
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const verifiedUser = await this.userRepository.markVerified(user.id);

    return Result.ok({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      isVerified: verifiedUser.isVerified,
    });
  }
}
