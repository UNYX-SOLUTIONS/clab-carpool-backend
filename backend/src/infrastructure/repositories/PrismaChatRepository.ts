import { PrismaClient } from '@prisma/client';

import { Chat } from '../../domain/entities/Chat';
import {
  CreateChatData,
  IChatRepository,
} from '../../domain/repositories/IChatRepository';

export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateChatData): Promise<Chat> {
    const chat = await this.prisma.chat.create({
      data: {
        travelId: data.travelId,
        user1Id: data.user1Id,
        user2Id: data.user2Id,
      },
      include: {
        user1: { select: { fullName: true } },
        user2: { select: { fullName: true } },
      },
    });

    return Chat.create({
      id: chat.id,
      travelId: chat.travelId,
      user1Id: chat.user1Id,
      user1Name: chat.user1.fullName,
      user2Id: chat.user2Id,
      user2Name: chat.user2.fullName,
      isActive: chat.isActive,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });
  }

  async findById(id: string): Promise<Chat | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        user1: { select: { fullName: true } },
        user2: { select: { fullName: true } },
      },
    });

    if (!chat) return null;

    return Chat.create({
      id: chat.id,
      travelId: chat.travelId,
      user1Id: chat.user1Id,
      user1Name: chat.user1.fullName,
      user2Id: chat.user2Id,
      user2Name: chat.user2.fullName,
      isActive: chat.isActive,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<Chat[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        isActive: true,
      },
      include: {
        user1: { select: { fullName: true } },
        user2: { select: { fullName: true } },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: { content: true, sentAt: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return chats.map((chat) =>
      Chat.create({
        id: chat.id,
        travelId: chat.travelId,
        user1Id: chat.user1Id,
        user1Name: chat.user1.fullName,
        user2Id: chat.user2Id,
        user2Name: chat.user2.fullName,
        isActive: chat.isActive,
        lastMessageAt: chat.messages[0]?.sentAt ?? chat.lastMessageAt,
        lastMessage: chat.messages[0]?.content ?? null,
        unreadCount: chat._count.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      }),
    );
  }

  async findActiveByTravelAndUsers(
    travelId: string,
    user1Id: string,
    user2Id: string,
  ): Promise<Chat | null> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        travelId,
        isActive: true,
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
      include: {
        user1: { select: { fullName: true } },
        user2: { select: { fullName: true } },
      },
    });

    if (!chat) return null;

    return Chat.create({
      id: chat.id,
      travelId: chat.travelId,
      user1Id: chat.user1Id,
      user1Name: chat.user1.fullName,
      user2Id: chat.user2Id,
      user2Name: chat.user2.fullName,
      isActive: chat.isActive,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });
  }

  async findActiveByTravelId(travelId: string): Promise<Chat | null> {
    const chat = await this.prisma.chat.findFirst({
      where: { travelId, isActive: true },
      include: {
        user1: { select: { fullName: true } },
        user2: { select: { fullName: true } },
      },
    });

    if (!chat) return null;

    return Chat.create({
      id: chat.id,
      travelId: chat.travelId,
      user1Id: chat.user1Id,
      user1Name: chat.user1.fullName,
      user2Id: chat.user2Id,
      user2Name: chat.user2.fullName,
      isActive: chat.isActive,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });
  }

  async updateLastMessage(chatId: string, _lastMessage: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() },
    });
  }
}
