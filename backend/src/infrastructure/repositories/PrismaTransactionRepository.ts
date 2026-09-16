import { PrismaClient } from '@prisma/client';

import { Transaction } from '../../domain/entities/Transaction';
import {
  CreateTransactionData,
  ITransactionRepository,
} from '../../domain/repositories/ITransactionRepository';

export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(row: {
    id: string;
    walletId: string;
    userId: string;
    amount: { toString: () => string } | number;
    type: string;
    status: string;
    description: string | null;
    referenceId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    const amount =
      typeof row.amount === 'number' ? row.amount : Number(row.amount.toString());

    return Transaction.create({
      id: row.id,
      walletId: row.walletId,
      userId: row.userId,
      amount,
      type: row.type,
      status: row.status,
      description: row.description,
      referenceId: row.referenceId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(data: CreateTransactionData): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: data.walletId,
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        status: data.status ?? 'completed',
        description: data.description,
        referenceId: data.referenceId,
      },
    });

    return this.toEntity(transaction);
  }

  async findByWalletId(walletId: string, limit: number = 50): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((transaction) => this.toEntity(transaction));
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((transaction) => this.toEntity(transaction));
  }
}
