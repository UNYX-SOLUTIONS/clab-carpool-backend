import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Money } from '../../../domain/value-objects/Money';
import { IWalletRepository } from '../../../domain/repositories/IWalletRepository';
import { RechargeRequestDTO } from '../../dtos/wallet/RechargeRequestDTO';

export interface RechargeWalletResult {
  walletId: string;
  balance: number;
  transactionId: string;
  amount: number;
  paymentMethod: string;
}

export class RechargeWalletUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(
    userId: string,
    dto: RechargeRequestDTO,
  ): Promise<Result<RechargeWalletResult>> {
    const moneyResult = Money.create(dto.amount);

    if (moneyResult.isFailure) {
      return Result.fail(moneyResult.error);
    }

    const money = moneyResult.value;

    if (money.amount <= 0) {
      return Result.fail(
        new AppError(
          'INVALID_AMOUNT',
          ErrorMessages.INVALID_AMOUNT,
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const { wallet, transaction } = await this.walletRepository.recharge(
      userId,
      money.amount,
      `Recarga de saldo vía ${dto.paymentMethod}`,
    );

    return Result.ok({
      walletId: wallet.id,
      balance: wallet.balance,
      transactionId: transaction.id,
      amount: transaction.amount,
      paymentMethod: dto.paymentMethod,
    });
  }
}
