import { PrismaClient } from '@prisma/client';

import { Vehicle } from '../../domain/entities/Vehicle';
import {
  CreateVehicleData,
  IVehicleRepository,
} from '../../domain/repositories/IVehicleRepository';

export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateVehicleData): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        userId: data.userId,
        brand: data.brand,
        model: data.model,
        plate: data.plate,
        color: data.color,
        seats: data.seats,
      },
    });

    return Vehicle.create({
      id: vehicle.id,
      userId: vehicle.userId,
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      color: vehicle.color,
      seats: vehicle.seats,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }).value;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) return null;

    return Vehicle.create({
      id: vehicle.id,
      userId: vehicle.userId,
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      color: vehicle.color,
      seats: vehicle.seats,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }).value;
  }

  async findByUserId(userId: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { userId, isActive: true },
    });

    if (!vehicle) return null;

    return Vehicle.create({
      id: vehicle.id,
      userId: vehicle.userId,
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      color: vehicle.color,
      seats: vehicle.seats,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }).value;
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { plate },
    });

    if (!vehicle) return null;

    return Vehicle.create({
      id: vehicle.id,
      userId: vehicle.userId,
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      color: vehicle.color,
      seats: vehicle.seats,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }).value;
  }

  async update(
    id: string,
    data: Partial<CreateVehicleData>,
  ): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        brand: data.brand ?? undefined,
        model: data.model ?? undefined,
        plate: data.plate ?? undefined,
        color: data.color ?? undefined,
        seats: data.seats ?? undefined,
      },
    });

    return Vehicle.create({
      id: vehicle.id,
      userId: vehicle.userId,
      brand: vehicle.brand,
      model: vehicle.model,
      plate: vehicle.plate,
      color: vehicle.color,
      seats: vehicle.seats,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }).value;
  }
}
