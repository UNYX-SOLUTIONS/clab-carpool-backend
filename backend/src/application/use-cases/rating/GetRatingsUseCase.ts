import { Result } from '../../../shared/core/Result';
import { Rating } from '../../../domain/entities/Rating';
import { IRatingRepository } from '../../../domain/repositories/IRatingRepository';

export interface RatingsResult {
  ratings: Rating[];
  average: number | null;
  total: number;
}

export class GetRatingsUseCase {
  constructor(private readonly ratingRepository: IRatingRepository) {}

  async execute(userId: string): Promise<Result<RatingsResult>> {
    const ratings = await this.ratingRepository.findByRatedUser(userId);
    const average = await this.ratingRepository.getAverageByRatedUser(userId);

    return Result.ok({
      ratings,
      average,
      total: ratings.length,
    });
  }
}
