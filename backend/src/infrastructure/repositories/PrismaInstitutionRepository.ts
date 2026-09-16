import { PrismaClient } from '@prisma/client';

import { Institution } from '../../domain/entities/Institution';
import { IInstitutionRepository } from '../../domain/repositories/IInstitutionRepository';

export class PrismaInstitutionRepository implements IInstitutionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) return null;

    return Institution.create({
      id: institution.id,
      name: institution.name,
      domain: institution.domain,
      isActive: institution.isActive,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    });
  }

  async findByDomain(domain: string): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { domain },
    });

    if (!institution) return null;

    return Institution.create({
      id: institution.id,
      name: institution.name,
      domain: institution.domain,
      isActive: institution.isActive,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    });
  }

  async findAllActive(): Promise<Institution[]> {
    const institutions = await this.prisma.institution.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return institutions.map((institution) =>
      Institution.create({
        id: institution.id,
        name: institution.name,
        domain: institution.domain,
        isActive: institution.isActive,
        createdAt: institution.createdAt,
        updatedAt: institution.updatedAt,
      }),
    );
  }
}
