import { Result } from '../../../shared/core/Result';
import { IInstitutionRepository } from '../../../domain/repositories/IInstitutionRepository';

export interface InstitutionSummary {
  id: string;
  name: string;
  domain: string;
}

export class GetInstitutionsUseCase {
  constructor(private readonly institutionRepository: IInstitutionRepository) {}

  async execute(): Promise<Result<InstitutionSummary[]>> {
    const institutions = await this.institutionRepository.findAllActive();

    return Result.ok(
      institutions.map((institution) => ({
        id: institution.id,
        name: institution.name,
        domain: institution.domain,
      })),
    );
  }
}
