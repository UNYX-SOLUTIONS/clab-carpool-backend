import { Result } from '../../../shared/core/Result';
import { Travel } from '../../../domain/entities/Travel';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';
import { ITravelRequestRepository } from '../../../domain/repositories/ITravelRequestRepository';

export interface MyTravelsResult {
  asDriver: Travel[];
  asPassenger: Travel[];
}

export class GetMyTravelsUseCase {
  constructor(
    private readonly travelRepository: ITravelRepository,
    private readonly travelRequestRepository: ITravelRequestRepository,
  ) {}

  async execute(userId: string): Promise<Result<MyTravelsResult>> {
    const asDriver = await this.travelRepository.findByUserId(userId);

    const requests = await this.travelRequestRepository.findByPassengerId(userId);

    const travelIds = [...new Set(requests.map((r) => r.travelId))];

    const passengerTravels: Travel[] = [];

    for (const travelId of travelIds) {
      const travel = await this.travelRepository.findById(travelId);
      if (travel) {
        passengerTravels.push(travel);
      }
    }

    return Result.ok({ asDriver, asPassenger: passengerTravels });
  }
}
