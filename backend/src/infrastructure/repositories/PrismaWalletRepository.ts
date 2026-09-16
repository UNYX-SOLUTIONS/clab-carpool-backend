import { PrismaClient } from '@prisma/client';

import { Transaction } from '../../domain/entities/Transaction';
import { Wallet } from '../../domain/entities/Wallet';
import {
  IWalletRepository,
  RechargeResult,
} from '../../domain/repositories/IWalletRepository';

export class PrismaWalletRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toWallet(row: {
    id: string;
    userId: string;
    balance: { toString: () => string } | number;
    createdAt: Date;
    updatedAt: Date;
  }): Wallet {
    const balance =
      typeof row.balance === 'number' ? row.balance : Number(row.balance.toString());

    return Wallet.create({
      id: row.id,
      userId: row.userId,
      balance,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toTransaction(row: {
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

  async create(userId: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.create({
      data: { userId },
    });

    return this.toWallet(wallet);
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) return null;

    return this.toWallet(wallet);
  }

  async getOrCreate(userId: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (wallet) {
      return this.toWallet(wallet);
    }

    const created = await this.prisma.wallet.create({
      data: { userId },
    });

    return this.toWallet(created);
  }

  async updateBalance(walletId: string, balance: number): Promise<Wallet> {
    const wallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: { balance },
    });

    return this.toWallet(wallet);
  }

  async recharge(
    userId: string,
    amount: number,
    description?: string,
  ): Promise<RechargeResult> {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          userId,
          amount,
          type: 'recharge',
          status: 'completed',
          description: description ?? 'Recarga de saldo',
        },
      });

      return {
        wallet: this.toWallet(updatedWallet),
        transaction: this.toTransaction(transaction),
      };
    });
  }
}
