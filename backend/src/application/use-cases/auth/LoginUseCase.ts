import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { normalizeEmail } from '../../../shared/utils/stringUtils';
import { InvalidCredentialsException } from '../../../domain/exceptions/InvalidCredentialsException';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEncryptionService } from '../../interfaces/IEncryptionService';
import { IAuthService, TokenPair } from '../../interfaces/IAuthService';
import { LoginRequestDTO } from '../../dtos/auth/LoginRequestDTO';

export interface LoginResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    isVerified: boolean;
    isDriver: boolean;
    institutionId: string;
  };
  tokens: TokenPair;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly encryptionService: IEncryptionService,
    private readonly authService: IAuthService,
  ) {}

  async execute(dto: LoginRequestDTO): Promise<Result<LoginResult>> {
    const email = normalizeEmail(dto.email);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return Result.fail(new InvalidCredentialsException());
    }

    const passwordMatches = await this.encryptionService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return Result.fail(new InvalidCredentialsException());
    }

    if (!user.isVerified) {
      return Result.fail(
        new AppError(
          'USER_NOT_VERIFIED',
          ErrorMessages.USER_NOT_VERIFIED,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const tokens = this.authService.generateTokenPair(user.id, {
      userId: user.id,
      email: user.email,
      role: user.isDriver ? 'driver' : 'passenger',
      isDriver: user.isDriver,
      isVerified: user.isVerified,
    });

    return Result.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isVerified: user.isVerified,
        isDriver: user.isDriver,
        institutionId: user.institutionId,
      },
      tokens,
    });
  }
}
