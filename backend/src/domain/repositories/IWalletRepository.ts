import { Transaction } from '../entities/Transaction';
import { Wallet } from '../entities/Wallet';

export interface RechargeResult {
  wallet: Wallet;
  transaction: Transaction;
}

export interface IWalletRepository {
  create(userId: string): Promise<Wallet>;
  findByUserId(userId: string): Promise<Wallet | null>;
  getOrCreate(userId: string): Promise<Wallet>;
  updateBalance(walletId: string, balance: number): Promise<Wallet>;
  recharge(userId: string, amount: number, description?: string): Promise<RechargeResult>;
}
