import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Rating } from '../../../domain/entities/Rating';
import { TravelNotFoundException } from '../../../domain/exceptions/TravelNotFoundException';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';
import { ITravelRequestRepository } from '../../../domain/repositories/ITravelRequestRepository';
import { IRatingRepository } from '../../../domain/repositories/IRatingRepository';

export interface RateTripInput {
  travelId: string;
  score: number;
  comment?: string;
}

export class RateTripUseCase {
  constructor(
    private readonly travelRepository: ITravelRepository,
    private readonly travelRequestRepository: ITravelRequestRepository,
    private readonly ratingRepository: IRatingRepository,
  ) {}

  async execute(
    raterId: string,
    input: RateTripInput,
  ): Promise<Result<Rating>> {
    const travel = await this.travelRepository.findById(input.travelId);

    if (!travel) {
      return Result.fail(new TravelNotFoundException());
    }

    if (travel.status !== 'completed') {
      return Result.fail(
        new AppError(
          'TRAVEL_NOT_COMPLETED',
          'Solo se pueden calificar viajes completados',
          HttpStatus.CONFLICT,
        ),
      );
    }

    const isDriver = travel.driverId === raterId;

    let ratedId: string | null = null;

    if (isDriver) {
      const requests = await this.travelRequestRepository.findByTravelId(
        travel.id,
      );
      const confirmed = requests.find((r) => r.status === 'confirmed');

      if (confirmed) {
        ratedId = confirmed.passengerId;
      }
    } else {
      const requests = await this.travelRequestRepository.findByTravelId(
        travel.id,
      );
      const ownRequest = requests.find((r) => r.passengerId === raterId);

      if (ownRequest && ownRequest.status === 'confirmed') {
        ratedId = travel.driverId;
      }
    }

    if (!ratedId) {
      return Result.fail(
        new AppError(
          'FORBIDDEN',
          'Solo los participantes del viaje pueden calificar',
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const existingRating = await this.ratingRepository.findByTravelAndRater(
      travel.id,
      raterId,
    );

    if (existingRating) {
      return Result.fail(
        new AppError(
          'RATING_ALREADY_EXISTS',
          ErrorMessages.RATING_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        ),
      );
    }

    const ratingResult = Rating.create({
      id: '',
      travelId: travel.id,
      raterId,
      ratedId,
      score: input.score,
      comment: input.comment?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (ratingResult.isFailure) {
      return Result.fail(ratingResult.error);
    }

    const rating = await this.ratingRepository.create({
      travelId: travel.id,
      raterId,
      ratedId,
      score: input.score,
      comment: input.comment?.trim(),
    });

    return Result.ok(rating);
  }
}
