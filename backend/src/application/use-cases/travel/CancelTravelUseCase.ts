import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { TravelStatus } from '../../../shared/constants/travelStatus';
import { TravelNotFoundException } from '../../../domain/exceptions/TravelNotFoundException';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';

export class CancelTravelUseCase {
  constructor(private readonly travelRepository: ITravelRepository) {}

  async execute(travelId: string, userId: string): Promise<Result<void>> {
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

    await this.travelRepository.softDelete(travel.id);
    await this.travelRepository.updateStatus(travel.id, TravelStatus.CANCELLED);

    return Result.ok();
  }
}
