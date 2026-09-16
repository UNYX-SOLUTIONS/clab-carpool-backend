import { Chat } from '../entities/Chat';

export interface CreateChatData {
  travelId: string;
  user1Id: string;
  user2Id: string;
}

export interface IChatRepository {
  create(data: CreateChatData): Promise<Chat>;
  findById(id: string): Promise<Chat | null>;
  findByUserId(userId: string): Promise<Chat[]>;
  findActiveByTravelAndUsers(
    travelId: string,
    user1Id: string,
    user2Id: string,
  ): Promise<Chat | null>;
  findActiveByTravelId(travelId: string): Promise<Chat | null>;
  updateLastMessage(chatId: string, lastMessage: string): Promise<void>;
}
