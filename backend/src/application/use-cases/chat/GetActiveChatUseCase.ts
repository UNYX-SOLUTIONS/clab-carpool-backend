import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Chat } from '../../../domain/entities/Chat';
import { IChatRepository } from '../../../domain/repositories/IChatRepository';

export class GetActiveChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(travelId: string, userId: string): Promise<Result<Chat>> {
    const chat = await this.chatRepository.findActiveByTravelId(travelId);

    if (!chat) {
      return Result.fail(
        new AppError(
          'CHAT_NOT_FOUND',
          ErrorMessages.CHAT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    if (!chat.isParticipant(userId)) {
      return Result.fail(
        new AppError(
          'FORBIDDEN',
          ErrorMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    return Result.ok(chat);
  }
}
