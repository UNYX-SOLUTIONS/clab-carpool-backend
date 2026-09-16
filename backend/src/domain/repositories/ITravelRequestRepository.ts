import { TravelRequest } from '../entities/TravelRequest';

export interface CreateTravelRequestData {
  travelId: string;
  passengerId: string;
}

export interface ITravelRequestRepository {
  create(data: CreateTravelRequestData): Promise<TravelRequest>;
  findById(id: string): Promise<TravelRequest | null>;
  findByTravelId(travelId: string): Promise<TravelRequest[]>;
  findPendingByTravelAndPassenger(
    travelId: string,
    passengerId: string,
  ): Promise<TravelRequest | null>;
  updateStatus(
    id: string,
    status: string,
    timestampField: 'confirmedAt' | 'rejectedAt' | 'cancelledAt',
  ): Promise<TravelRequest>;
  findByPassengerId(passengerId: string): Promise<TravelRequest[]>;
}
