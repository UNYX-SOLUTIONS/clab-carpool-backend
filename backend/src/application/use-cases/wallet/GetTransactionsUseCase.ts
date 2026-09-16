import { Result } from '../../../shared/core/Result';
import { Transaction } from '../../../domain/entities/Transaction';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(userId: string, limit?: number): Promise<Result<Transaction[]>> {
    const transactions = await this.transactionRepository.findByUserId(
      userId,
      limit ?? 50,
    );

    return Result.ok(transactions);
  }
}
