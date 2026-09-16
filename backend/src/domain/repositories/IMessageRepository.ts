import { Message } from '../entities/Message';

export interface CreateMessageData {
  chatId: string;
  senderId: string;
  content: string;
  type?: string;
}

export interface IMessageRepository {
  create(data: CreateMessageData): Promise<Message>;
  findByChatId(chatId: string, limit?: number): Promise<Message[]>;
  markAsRead(chatId: string, userId: string): Promise<number>;
  countUnread(chatId: string, userId: string): Promise<number>;
}
