import { PrismaClient } from '@prisma/client';

import { Travel } from '../../domain/entities/Travel';
import {
  CreateTravelData,
  ITravelRepository,
  TravelFilters,
} from '../../domain/repositories/ITravelRepository';

export class PrismaTravelRepository implements ITravelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: {
    id: string;
    driverId: string;
    vehicleId: string;
    origin: string;
    destination: string;
    departureTime: Date;
    availableSeats: number;
    pricePerSeat: { toString: () => string } | number;
    status: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    driver?: { fullName: string } | null;
    vehicle?: {
      brand: string;
      model: string;
      plate: string;
      color: string;
      seats: number;
    } | null;
  }): Travel {
    const price =
      typeof row.pricePerSeat === 'number'
        ? row.pricePerSeat
        : Number(row.pricePerSeat.toString());

    return Travel.create({
      id: row.id,
      driverId: row.driverId,
      driverName: row.driver?.fullName,
      vehicleId: row.vehicleId,
      vehicle: row.vehicle ?? null,
      origin: row.origin,
      destination: row.destination,
      departureTime: row.departureTime,
      availableSeats: row.availableSeats,
      pricePerSeat: price,
      status: row.status,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }).value;
  }

  async create(data: CreateTravelData): Promise<Travel> {
    const travel = await this.prisma.travel.create({
      data: {
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        origin: data.origin,
        destination: data.destination,
        departureTime: data.departureTime,
        availableSeats: data.availableSeats,
        pricePerSeat: data.pricePerSeat,
      },
      include: {
        driver: { select: { fullName: true } },
        vehicle: {
          select: { brand: true, model: true, plate: true, color: true, seats: true },
        },
      },
    });

    return this.toEntity(travel);
  }

  async findById(id: string): Promise<Travel | null> {
    const travel = await this.prisma.travel.findUnique({
      where: { id },
      include: {
        driver: { select: { fullName: true } },
        vehicle: {
          select: { brand: true, model: true, plate: true, color: true, seats: true },
        },
      },
    });

    if (!travel) return null;

    return this.toEntity(travel);
  }

  async findAvailable(filters?: TravelFilters): Promise<Travel[]> {
    const travels = await this.prisma.travel.findMany({
      where: {
        isActive: true,
        status: 'active',
        departureTime: { gte: new Date() },
        ...(filters?.origin
          ? { origin: { contains: filters.origin, mode: 'insensitive' as const } }
          : {}),
        ...(filters?.destination
          ? {
              destination: {
                contains: filters.destination,
                mode: 'insensitive' as const,
              },
            }
          : {}),
        ...(filters?.departureDateFrom || filters?.departureDateTo
          ? {
              departureTime: {
                gte: new Date(),
                ...(filters?.departureDateFrom
                  ? { gte: filters.departureDateFrom }
                  : {}),
                ...(filters?.departureDateTo ? { lte: filters.departureDateTo } : {}),
              },
            }
          : {}),
        ...(filters?.minSeats
          ? { availableSeats: { gte: filters.minSeats } }
          : { availableSeats: { gt: 0 } }),
        ...(filters?.maxPrice !== undefined
          ? { pricePerSeat: { lte: filters.maxPrice } }
          : {}),
        ...(filters?.excludeDriverId
          ? { driverId: { not: filters.excludeDriverId } }
          : {}),
      },
      include: {
        driver: { select: { fullName: true } },
        vehicle: {
          select: { brand: true, model: true, plate: true, color: true, seats: true },
        },
      },
      orderBy: { departureTime: 'asc' },
    });

    return travels.map((travel) => this.toEntity(travel));
  }

  async updateStatus(id: string, status: string): Promise<Travel> {
    const travel = await this.prisma.travel.update({
      where: { id },
      data: { status },
      include: {
        driver: { select: { fullName: true } },
        vehicle: {
          select: { brand: true, model: true, plate: true, color: true, seats: true },
        },
      },
    });

    return this.toEntity(travel);
  }

  async updateSeats(id: string, availableSeats: number): Promise<Travel> {
    const travel = await this.prisma.travel.update({
      where: { id },
      data: { availableSeats },
      include: {
        driver: { select: { fullName: true } },
        vehicle: {
          select: { brand: true, model: true, plate: true, color: true, seats: true },
        },
      },
    });

    return this.toEntity(travel);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.travel.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByUserId(userId: string): Promise<Travel[]> {
    const travels = await this.prisma.travel.findMany({
      where: { driverId: userId },
      include: {
        driver: { select: { fullName: true } },
        vehicle: {
          select: { brand: true, model: true, plate: true, color: true, seats: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return travels.map((travel) => this.toEntity(travel));
  }
}
