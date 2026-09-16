import { Result } from '../../../shared/core/Result';
import { Wallet } from '../../../domain/entities/Wallet';
import { IWalletRepository } from '../../../domain/repositories/IWalletRepository';

export class GetWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(userId: string): Promise<Result<Wallet>> {
    const wallet = await this.walletRepository.getOrCreate(userId);

    return Result.ok(wallet);
  }
}
