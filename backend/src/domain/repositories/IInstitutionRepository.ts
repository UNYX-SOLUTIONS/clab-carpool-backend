import { Institution } from '../entities/Institution';

export interface IInstitutionRepository {
  findById(id: string): Promise<Institution | null>;
  findByDomain(domain: string): Promise<Institution | null>;
  findAllActive(): Promise<Institution[]>;
}
