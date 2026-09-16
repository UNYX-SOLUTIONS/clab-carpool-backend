import { PrismaClient } from '@prisma/client';

import { TravelRequest } from '../../domain/entities/TravelRequest';
import {
  CreateTravelRequestData,
  ITravelRequestRepository,
} from '../../domain/repositories/ITravelRequestRepository';

export class PrismaTravelRequestRepository implements ITravelRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: {
    id: string;
    travelId: string;
    passengerId: string;
    status: string;
    requestedAt: Date;
    confirmedAt: Date | null;
    rejectedAt: Date | null;
    cancelledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    passenger?: { fullName: string } | null;
  }): TravelRequest {
    return TravelRequest.create({
      id: row.id,
      travelId: row.travelId,
      passengerId: row.passengerId,
      passengerName: row.passenger?.fullName,
      status: row.status,
      requestedAt: row.requestedAt,
      confirmedAt: row.confirmedAt,
      rejectedAt: row.rejectedAt,
      cancelledAt: row.cancelledAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(data: CreateTravelRequestData): Promise<TravelRequest> {
    const request = await this.prisma.travelRequest.create({
      data: {
        travelId: data.travelId,
        passengerId: data.passengerId,
      },
      include: { passenger: { select: { fullName: true } } },
    });

    return this.toEntity(request);
  }

  async findById(id: string): Promise<TravelRequest | null> {
    const request = await this.prisma.travelRequest.findUnique({
      where: { id },
      include: { passenger: { select: { fullName: true } } },
    });

    if (!request) return null;

    return this.toEntity(request);
  }

  async findByTravelId(travelId: string): Promise<TravelRequest[]> {
    const requests = await this.prisma.travelRequest.findMany({
      where: { travelId },
      include: { passenger: { select: { fullName: true } } },
      orderBy: { requestedAt: 'asc' },
    });

    return requests.map((request) => this.toEntity(request));
  }

  async findPendingByTravelAndPassenger(
    travelId: string,
    passengerId: string,
  ): Promise<TravelRequest | null> {
    const request = await this.prisma.travelRequest.findFirst({
      where: {
        travelId,
        passengerId,
        status: { in: ['pending', 'confirmed'] },
      },
      include: { passenger: { select: { fullName: true } } },
    });

    if (!request) return null;

    return this.toEntity(request);
  }

  async updateStatus(
    id: string,
    status: string,
    timestampField: 'confirmedAt' | 'rejectedAt' | 'cancelledAt',
  ): Promise<TravelRequest> {
    const request = await this.prisma.travelRequest.update({
      where: { id },
      data: {
        status,
        [timestampField]: new Date(),
      },
      include: { passenger: { select: { fullName: true } } },
    });

    return this.toEntity(request);
  }

  async findByPassengerId(passengerId: string): Promise<TravelRequest[]> {
    const requests = await this.prisma.travelRequest.findMany({
      where: { passengerId },
      include: { passenger: { select: { fullName: true } } },
      orderBy: { requestedAt: 'desc' },
    });

    return requests.map((request) => this.toEntity(request));
  }
}
