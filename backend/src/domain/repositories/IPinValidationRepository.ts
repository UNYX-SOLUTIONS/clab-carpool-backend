import { PinValidation } from '../entities/PinValidation';

export interface CreatePinValidationData {
  userId: string;
  travelId: string;
  pin: string;
  expiresAt: Date;
}

export interface IPinValidationRepository {
  create(data: CreatePinValidationData): Promise<PinValidation>;
  findById(id: string): Promise<PinValidation | null>;
  findActiveByTravelId(travelId: string): Promise<PinValidation | null>;
  markUsed(id: string): Promise<PinValidation>;
}
