import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { sanitizeContent } from '../../../shared/utils/stringUtils';
import { Message } from '../../../domain/entities/Message';
import { IChatRepository } from '../../../domain/repositories/IChatRepository';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { SendMessageDTO } from '../../dtos/chat/SendMessageDTO';

export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    senderId: string,
    dto: SendMessageDTO,
  ): Promise<Result<Message>> {
    const chat = await this.chatRepository.findById(dto.chatId);

    if (!chat) {
      return Result.fail(
        new AppError(
          'CHAT_NOT_FOUND',
          ErrorMessages.CHAT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    if (!chat.isActive) {
      return Result.fail(
        new AppError(
          'CHAT_NOT_ACTIVE',
          ErrorMessages.CHAT_NOT_ACTIVE,
          HttpStatus.CONFLICT,
        ),
      );
    }

    if (!chat.isParticipant(senderId)) {
      return Result.fail(
        new AppError(
          'FORBIDDEN',
          ErrorMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const content = sanitizeContent(dto.content);

    if (!content) {
      return Result.fail(
        new AppError(
          'VALIDATION_ERROR',
          'El mensaje no puede estar vacío',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const message = await this.messageRepository.create({
      chatId: chat.id,
      senderId,
      content,
    });

    await this.chatRepository.updateLastMessage(chat.id, content);

    return Result.ok(message);
  }
}
