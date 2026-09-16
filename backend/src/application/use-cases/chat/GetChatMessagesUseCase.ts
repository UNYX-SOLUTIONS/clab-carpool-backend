import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Message } from '../../../domain/entities/Message';
import { IChatRepository } from '../../../domain/repositories/IChatRepository';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';

export class GetChatMessagesUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    chatId: string,
    userId: string,
  ): Promise<Result<{ messages: Message[]; unreadMarked: number }>> {
    const chat = await this.chatRepository.findById(chatId);

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

    const unreadMarked = await this.messageRepository.markAsRead(chatId, userId);

    const messages = await this.messageRepository.findByChatId(chatId, 100);

    return Result.ok({ messages, unreadMarked });
  }
}
