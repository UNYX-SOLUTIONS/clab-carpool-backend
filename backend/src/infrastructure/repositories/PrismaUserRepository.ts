import { PrismaClient } from '@prisma/client';

import { User } from '../../domain/entities/User';
import {
  CreateUserData,
  IUserRepository,
} from '../../domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        institutionId: data.institutionId,
        phone: data.phone,
        photoUrl: data.photoUrl,
      },
      include: { institution: true },
    });

    return User.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      institutionId: user.institutionId,
      institutionName: user.institution.name,
      institutionDomain: user.institution.domain,
      isVerified: user.isVerified,
      isDriver: user.isDriver,
      phone: user.phone,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { institution: true },
    });

    if (!user) return null;

    return User.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      institutionId: user.institutionId,
      institutionName: user.institution.name,
      institutionDomain: user.institution.domain,
      isVerified: user.isVerified,
      isDriver: user.isDriver,
      phone: user.phone,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { institution: true },
    });

    if (!user) return null;

    return User.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      institutionId: user.institutionId,
      institutionName: user.institution.name,
      institutionDomain: user.institution.domain,
      isVerified: user.isVerified,
      isDriver: user.isDriver,
      phone: user.phone,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async update(
    id: string,
    data: Partial<Pick<User, 'fullName' | 'phone' | 'photoUrl'>>,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName ?? undefined,
        phone: data.phone ?? undefined,
        photoUrl: data.photoUrl ?? undefined,
      },
      include: { institution: true },
    });

    return User.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      institutionId: user.institutionId,
      institutionName: user.institution.name,
      institutionDomain: user.institution.domain,
      isVerified: user.isVerified,
      isDriver: user.isDriver,
      phone: user.phone,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async markVerified(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
      include: { institution: true },
    });

    return User.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      institutionId: user.institutionId,
      institutionName: user.institution.name,
      institutionDomain: user.institution.domain,
      isVerified: user.isVerified,
      isDriver: user.isDriver,
      phone: user.phone,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async markAsDriver(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isDriver: true },
      include: { institution: true },
    });

    return User.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      institutionId: user.institutionId,
      institutionName: user.institution.name,
      institutionDomain: user.institution.domain,
      isVerified: user.isVerified,
      isDriver: user.isDriver,
      phone: user.phone,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async setPasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
