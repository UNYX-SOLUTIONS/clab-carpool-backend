import { PrismaClient } from '@prisma/client';

import { Message } from '../../domain/entities/Message';
import {
  CreateMessageData,
  IMessageRepository,
} from '../../domain/repositories/IMessageRepository';

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMessageData): Promise<Message> {
    const message = await this.prisma.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
        type: data.type ?? 'text',
      },
    });

    return Message.create({
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      isRead: message.isRead,
      readAt: message.readAt,
      sentAt: message.sentAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });
  }

  async findByChatId(chatId: string, limit: number = 100): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });

    return messages
      .reverse()
      .map((message) =>
        Message.create({
          id: message.id,
          chatId: message.chatId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          isRead: message.isRead,
          readAt: message.readAt,
          sentAt: message.sentAt,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        }),
      );
  }

  async markAsRead(chatId: string, userId: string): Promise<number> {
    const result = await this.prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  async countUnread(chatId: string, userId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
    });
  }
}
