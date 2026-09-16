import { Result } from '../../../shared/core/Result';
import { Chat } from '../../../domain/entities/Chat';
import { IChatRepository } from '../../../domain/repositories/IChatRepository';

export class GetChatsUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(userId: string): Promise<Result<Chat[]>> {
    const chats = await this.chatRepository.findByUserId(userId);

    return Result.ok(chats);
  }
}
