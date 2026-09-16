import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { TravelNotFoundException } from '../../../domain/exceptions/TravelNotFoundException';
import { TravelFullException } from '../../../domain/exceptions/TravelFullException';
import { TravelRequest } from '../../../domain/entities/TravelRequest';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';
import { ITravelRequestRepository } from '../../../domain/repositories/ITravelRequestRepository';
import { IChatRepository } from '../../../domain/repositories/IChatRepository';
import { RequestTravelDTO } from '../../dtos/travel/RequestTravelDTO';

export interface RequestTravelResult {
  request: TravelRequest;
  chatId: string | null;
}

export class RequestTravelUseCase {
  constructor(
    private readonly travelRepository: ITravelRepository,
    private readonly travelRequestRepository: ITravelRequestRepository,
    private readonly chatRepository: IChatRepository,
  ) {}

  async execute(
    passengerId: string,
    dto: RequestTravelDTO,
  ): Promise<Result<RequestTravelResult>> {
    const travel = await this.travelRepository.findById(dto.travelId);

    if (!travel) {
      return Result.fail(new TravelNotFoundException());
    }

    if (!travel.isActive || travel.status !== 'active') {
      return Result.fail(
        new AppError(
          'TRAVEL_NOT_ACTIVE',
          ErrorMessages.TRAVEL_NOT_ACTIVE,
          HttpStatus.CONFLICT,
        ),
      );
    }

    if (travel.driverId === passengerId) {
      return Result.fail(
        new AppError(
          'TRAVEL_OWN_REQUEST',
          'No puedes solicitar tu propio viaje',
          HttpStatus.CONFLICT,
        ),
      );
    }

    if (!travel.hasAvailableSeats()) {
      return Result.fail(new TravelFullException());
    }

    const existingRequest =
      await this.travelRequestRepository.findPendingByTravelAndPassenger(
        travel.id,
        passengerId,
      );

    if (existingRequest) {
      return Result.fail(
        new AppError(
          'TRAVEL_ALREADY_REQUESTED',
          ErrorMessages.TRAVEL_ALREADY_REQUESTED,
          HttpStatus.CONFLICT,
        ),
      );
    }

    const request = await this.travelRequestRepository.create({
      travelId: travel.id,
      passengerId,
    });

    await this.travelRepository.updateSeats(
      travel.id,
      travel.availableSeats - 1,
    );

    let chatId: string | null = null;

    const existingChat = await this.chatRepository.findActiveByTravelAndUsers(
      travel.id,
      travel.driverId,
      passengerId,
    );

    if (existingChat) {
      chatId = existingChat.id;
    } else {
      const chat = await this.chatRepository.create({
        travelId: travel.id,
        user1Id: travel.driverId,
        user2Id: passengerId,
      });
      chatId = chat.id;
    }

    return Result.ok({ request, chatId });
  }
}
