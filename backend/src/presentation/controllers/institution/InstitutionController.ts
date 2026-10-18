import { Request, Response } from 'express';

import { GetInstitutionsUseCase } from '../../../application/use-cases/institution/GetInstitutionsUseCase';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class InstitutionController {
  constructor(private readonly getInstitutionsUseCase: GetInstitutionsUseCase) {}

  async list(_req: Request, res: Response): Promise<void> {
    const result = await this.getInstitutionsUseCase.execute();

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(
      res,
      HttpStatus.OK,
      'Instituciones obtenidas correctamente',
      result.value,
    );
  }
}
