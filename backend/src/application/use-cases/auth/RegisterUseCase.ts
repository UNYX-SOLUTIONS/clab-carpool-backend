import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { normalizeEmail, extractEmailDomain } from '../../../shared/utils/stringUtils';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IInstitutionRepository } from '../../../domain/repositories/IInstitutionRepository';
import { IWalletRepository } from '../../../domain/repositories/IWalletRepository';
import { IEncryptionService } from '../../interfaces/IEncryptionService';
import { IEmailService } from '../../interfaces/IEmailService';
import { IAuthService } from '../../interfaces/IAuthService';
import { RegisterRequestDTO } from '../../dtos/auth/RegisterRequestDTO';

export interface RegisterResult {
  userId: string;
  email: string;
  fullName: string;
  institutionId: string;
  institutionName: string;
  verificationCodeSent: boolean;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly institutionRepository: IInstitutionRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly encryptionService: IEncryptionService,
    private readonly emailService: IEmailService,
    private readonly authService: IAuthService,
  ) {}

  async execute(dto: RegisterRequestDTO): Promise<Result<RegisterResult>> {
    const email = normalizeEmail(dto.email);

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      return Result.fail(
        new AppError(
          'USER_ALREADY_EXISTS',
          ErrorMessages.USER_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        ),
      );
    }

    const institution = await this.institutionRepository.findById(dto.institutionId);

    if (!institution) {
      return Result.fail(
        new AppError(
          'INSTITUTION_NOT_FOUND',
          ErrorMessages.INSTITUTION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    if (!institution.isActive) {
      return Result.fail(
        new AppError(
          'INSTITUTION_INACTIVE',
          ErrorMessages.INSTITUTION_INACTIVE,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const emailDomain = extractEmailDomain(email);

    if (emailDomain !== institution.domain) {
      return Result.fail(
        new AppError(
          'INVALID_EMAIL_DOMAIN',
          ErrorMessages.INVALID_EMAIL_DOMAIN,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const passwordHash = await this.encryptionService.hash(dto.password);

    const user = await this.userRepository.create({
      email,
      passwordHash,
      fullName: dto.fullName.trim(),
      institutionId: institution.id,
    });

    await this.walletRepository.create(user.id);
    const verificationCode = this.authService.generateEmailVerificationCode(email);

    let verificationCodeSent = false;
    try {
      await this.emailService.sendVerificationCode(email, user.fullName, verificationCode);
      verificationCodeSent = true;
    } catch {
      verificationCodeSent = false;
    }

    return Result.ok({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      institutionId: institution.id,
      institutionName: institution.name,
      verificationCodeSent,
    });
  }
}
