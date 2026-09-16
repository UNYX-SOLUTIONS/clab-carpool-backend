import { Travel } from '../entities/Travel';

export interface CreateTravelData {
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  departureTime: Date;
  availableSeats: number;
  pricePerSeat: number;
}

export interface TravelFilters {
  origin?: string;
  destination?: string;
  departureDateFrom?: Date;
  departureDateTo?: Date;
  minSeats?: number;
  maxPrice?: number;
  excludeDriverId?: string;
}

export interface ITravelRepository {
  create(data: CreateTravelData): Promise<Travel>;
  findById(id: string): Promise<Travel | null>;
  findAvailable(filters?: TravelFilters): Promise<Travel[]>;
  updateStatus(id: string, status: string): Promise<Travel>;
  updateSeats(id: string, availableSeats: number): Promise<Travel>;
  softDelete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<Travel[]>;
}
