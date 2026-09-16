import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { extractEmailDomain, normalizeEmail } from '../../../shared/utils/stringUtils';
import { IInstitutionRepository } from '../../../domain/repositories/IInstitutionRepository';

export interface InstitutionVerificationResult {
  institutionId: string;
  name: string;
  domain: string;
  isValid: boolean;
}

export class VerifyInstitutionUseCase {
  constructor(private readonly institutionRepository: IInstitutionRepository) {}

  async execute(email: string): Promise<Result<InstitutionVerificationResult>> {
    const domain = extractEmailDomain(normalizeEmail(email));

    const institution = await this.institutionRepository.findByDomain(domain);

    if (!institution) {
      return Result.fail(
        new AppError(
          'INVALID_EMAIL_DOMAIN',
          ErrorMessages.INVALID_EMAIL_DOMAIN,
          HttpStatus.FORBIDDEN,
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

    return Result.ok({
      institutionId: institution.id,
      name: institution.name,
      domain: institution.domain,
      isValid: true,
    });
  }
}
