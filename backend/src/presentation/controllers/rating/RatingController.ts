import { Request, Response } from 'express';

import { RateTripUseCase } from '../../../application/use-cases/rating/RateTripUseCase';
import { GetRatingsUseCase } from '../../../application/use-cases/rating/GetRatingsUseCase';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class RatingController {
  constructor(
    private readonly rateTripUseCase: RateTripUseCase,
    private readonly getRatingsUseCase: GetRatingsUseCase,
  ) {}

  async rate(req: Request, res: Response): Promise<void> {
    const result = await this.rateTripUseCase.execute(req.user!.id, req.body);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.CREATED, 'Calificación registrada', result.value);
  }

  async listByUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params as { userId: string };

    const result = await this.getRatingsUseCase.execute(userId);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Calificaciones obtenidas', result.value);
  }
}
