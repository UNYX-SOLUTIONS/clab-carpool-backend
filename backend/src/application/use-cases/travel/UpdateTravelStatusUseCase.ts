import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { TravelStatus } from '../../../shared/constants/travelStatus';
import { Travel } from '../../../domain/entities/Travel';
import { TravelNotFoundException } from '../../../domain/exceptions/TravelNotFoundException';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [TravelStatus.ACTIVE]: [TravelStatus.IN_PROGRESS, TravelStatus.CANCELLED],
  [TravelStatus.IN_PROGRESS]: [TravelStatus.COMPLETED, TravelStatus.CANCELLED],
};

export class UpdateTravelStatusUseCase {
  constructor(private readonly travelRepository: ITravelRepository) {}

  async execute(
    travelId: string,
    userId: string,
    newStatus: string,
  ): Promise<Result<Travel>> {
    const travel = await this.travelRepository.findById(travelId);

    if (!travel) {
      return Result.fail(new TravelNotFoundException());
    }

    if (travel.driverId !== userId) {
      return Result.fail(
        new AppError(
          'FORBIDDEN',
          ErrorMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const allowed = ALLOWED_TRANSITIONS[travel.status] ?? [];

    if (!allowed.includes(newStatus)) {
      return Result.fail(
        new AppError(
          'INVALID_STATUS_TRANSITION',
          `No se puede cambiar el viaje de "${travel.status}" a "${newStatus}"`,
          HttpStatus.CONFLICT,
        ),
      );
    }

    if (newStatus === TravelStatus.CANCELLED) {
      await this.travelRepository.softDelete(travel.id);
    }

    const updated = await this.travelRepository.updateStatus(travelId, newStatus);

    return Result.ok(updated);
  }
}
