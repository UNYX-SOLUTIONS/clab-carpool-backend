import { PrismaClient } from '@prisma/client';

import { PinValidation } from '../../domain/entities/PinValidation';
import {
  CreatePinValidationData,
  IPinValidationRepository,
} from '../../domain/repositories/IPinValidationRepository';

export class PrismaPinValidationRepository implements IPinValidationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: {
    id: string;
    userId: string;
    travelId: string;
    pin: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PinValidation {
    return PinValidation.create({
      id: row.id,
      userId: row.userId,
      travelId: row.travelId,
      pin: row.pin,
      expiresAt: row.expiresAt,
      isUsed: row.isUsed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(data: CreatePinValidationData): Promise<PinValidation> {
    const pinValidation = await this.prisma.pinValidation.create({
      data: {
        userId: data.userId,
        travelId: data.travelId,
        pin: data.pin,
        expiresAt: data.expiresAt,
      },
    });

    return this.toEntity(pinValidation);
  }

  async findById(id: string): Promise<PinValidation | null> {
    const pinValidation = await this.prisma.pinValidation.findUnique({
      where: { id },
    });

    if (!pinValidation) return null;

    return this.toEntity(pinValidation);
  }

  async findActiveByTravelId(travelId: string): Promise<PinValidation | null> {
    const pinValidation = await this.prisma.pinValidation.findFirst({
      where: {
        travelId,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!pinValidation) return null;

    return this.toEntity(pinValidation);
  }

  async markUsed(id: string): Promise<PinValidation> {
    const pinValidation = await this.prisma.pinValidation.update({
      where: { id },
      data: { isUsed: true },
    });

    return this.toEntity(pinValidation);
  }
}
