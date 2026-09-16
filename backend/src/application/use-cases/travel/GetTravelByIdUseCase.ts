import { Result } from '../../../shared/core/Result';
import { Travel } from '../../../domain/entities/Travel';
import { TravelNotFoundException } from '../../../domain/exceptions/TravelNotFoundException';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';

export class GetTravelByIdUseCase {
  constructor(private readonly travelRepository: ITravelRepository) {}

  async execute(travelId: string): Promise<Result<Travel>> {
    const travel = await this.travelRepository.findById(travelId);

    if (!travel) {
      return Result.fail(new TravelNotFoundException());
    }

    return Result.ok(travel);
  }
}
