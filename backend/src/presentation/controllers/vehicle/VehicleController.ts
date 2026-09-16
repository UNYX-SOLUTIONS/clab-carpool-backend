import { Request, Response } from 'express';

import { RegisterVehicleUseCase } from '../../../application/use-cases/vehicle/RegisterVehicleUseCase';
import { GetMyVehicleUseCase } from '../../../application/use-cases/vehicle/GetMyVehicleUseCase';
import { UpdateVehicleUseCase } from '../../../application/use-cases/vehicle/UpdateVehicleUseCase';
import { RegisterVehicleDTO } from '../../../application/dtos/vehicle/RegisterVehicleDTO';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class VehicleController {
  constructor(
    private readonly registerVehicleUseCase: RegisterVehicleUseCase,
    private readonly getMyVehicleUseCase: GetMyVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const result = await this.registerVehicleUseCase.execute(
      req.user!.id,
      req.body as RegisterVehicleDTO,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.CREATED, 'Vehículo registrado correctamente', result.value);
  }

  async getMyVehicle(req: Request, res: Response): Promise<void> {
    const result = await this.getMyVehicleUseCase.execute(req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Vehículo obtenido correctamente', result.value);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.updateVehicleUseCase.execute(
      id,
      req.user!.id,
      req.body as Partial<RegisterVehicleDTO>,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Vehículo actualizado correctamente', result.value);
  }
}
