import { Request, Response } from 'express';

import { GetWalletUseCase } from '../../../application/use-cases/wallet/GetWalletUseCase';
import { RechargeWalletUseCase } from '../../../application/use-cases/wallet/RechargeWalletUseCase';
import { GetTransactionsUseCase } from '../../../application/use-cases/wallet/GetTransactionsUseCase';
import { RechargeRequestDTO } from '../../../application/dtos/wallet/RechargeRequestDTO';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class WalletController {
  constructor(
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly rechargeWalletUseCase: RechargeWalletUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  async getBalance(req: Request, res: Response): Promise<void> {
    const result = await this.getWalletUseCase.execute(req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Saldo obtenido correctamente', {
      walletId: result.value.id,
      balance: result.value.balance,
    });
  }

  async recharge(req: Request, res: Response): Promise<void> {
    const result = await this.rechargeWalletUseCase.execute(
      req.user!.id,
      req.body as RechargeRequestDTO,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Saldo recargado correctamente', result.value);
  }

  async transactions(req: Request, res: Response): Promise<void> {
    const limitParam = (req.query as { limit?: string }).limit;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const result = await this.getTransactionsUseCase.execute(
      req.user!.id,
      Number.isNaN(limit) ? undefined : limit,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Transacciones obtenidas', result.value);
  }
}
