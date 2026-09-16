import { Vehicle } from '../entities/Vehicle';

export interface CreateVehicleData {
  userId: string;
  brand: string;
  model: string;
  plate: string;
  color: string;
  seats: number;
}

export interface IVehicleRepository {
  create(data: CreateVehicleData): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByUserId(userId: string): Promise<Vehicle | null>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  update(id: string, data: Partial<CreateVehicleData>): Promise<Vehicle>;
}
