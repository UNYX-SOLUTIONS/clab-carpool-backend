import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { UserNotFoundException } from '../../../domain/exceptions/UserNotFoundException';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IAuthService, TokenPair } from '../../interfaces/IAuthService';

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(refreshToken: string): Promise<Result<TokenPair>> {
    let payload;
    try {
      payload = this.authService.verifyRefreshToken(refreshToken);
    } catch {
      return Result.fail(
        new AppError(
          'INVALID_OR_EXPIRED_TOKEN',
          ErrorMessages.INVALID_OR_EXPIRED_TOKEN,
          HttpStatus.UNAUTHORIZED,
        ),
      );
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      return Result.fail(new UserNotFoundException());
    }

    const tokens = this.authService.generateTokenPair(user.id, {
      userId: user.id,
      email: user.email,
      role: user.isDriver ? 'driver' : 'passenger',
      isDriver: user.isDriver,
      isVerified: user.isVerified,
    });

    return Result.ok(tokens);
  }
}
