import { Request, Response } from 'express';

import { GetProfileUseCase } from '../../../application/use-cases/user/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../../application/use-cases/user/UpdateProfileUseCase';
import { GetUserByIdUseCase } from '../../../application/use-cases/user/GetUserByIdUseCase';
import { VerifyInstitutionUseCase } from '../../../application/use-cases/user/VerifyInstitutionUseCase';
import { UpdateProfileRequestDTO } from '../../../application/dtos/user/UpdateProfileRequestDTO';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly verifyInstitutionUseCase: VerifyInstitutionUseCase,
  ) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const result = await this.getProfileUseCase.execute(req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Perfil obtenido correctamente', result.value);
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const result = await this.updateProfileUseCase.execute(
      req.user!.id,
      req.body as UpdateProfileRequestDTO,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Perfil actualizado correctamente', result.value);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.getUserByIdUseCase.execute(id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Usuario obtenido correctamente', result.value);
  }

  async verifyInstitution(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string };

    const result = await this.verifyInstitutionUseCase.execute(email);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(
      res,
      HttpStatus.OK,
      'Institución verificada correctamente',
      result.value,
    );
  }
}
