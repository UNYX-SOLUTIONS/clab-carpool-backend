import { Transaction } from '../entities/Transaction';

export interface CreateTransactionData {
  walletId: string;
  userId: string;
  amount: number;
  type: string;
  status?: string;
  description?: string;
  referenceId?: string;
}

export interface ITransactionRepository {
  create(data: CreateTransactionData): Promise<Transaction>;
  findByWalletId(walletId: string, limit?: number): Promise<Transaction[]>;
  findByUserId(userId: string, limit?: number): Promise<Transaction[]>;
}
