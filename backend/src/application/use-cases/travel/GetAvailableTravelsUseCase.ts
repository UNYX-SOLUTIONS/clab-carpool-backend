import { Result } from '../../../shared/core/Result';
import { Travel } from '../../../domain/entities/Travel';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';
import { TravelFiltersDTO } from '../../dtos/travel/TravelFiltersDTO';

export class GetAvailableTravelsUseCase {
  constructor(private readonly travelRepository: ITravelRepository) {}

  async execute(
    filters: TravelFiltersDTO,
    userId: string,
  ): Promise<Result<Travel[]>> {
    const travels = await this.travelRepository.findAvailable({
      origin: filters.origin?.trim() || undefined,
      destination: filters.destination?.trim() || undefined,
      departureDateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      departureDateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      minSeats: filters.minSeats,
      maxPrice: filters.maxPrice,
      excludeDriverId: userId,
    });

    return Result.ok(travels);
  }
}
