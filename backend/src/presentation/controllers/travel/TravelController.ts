import { Request, Response } from 'express';

import { CreateTravelUseCase } from '../../../application/use-cases/travel/CreateTravelUseCase';
import { GetAvailableTravelsUseCase } from '../../../application/use-cases/travel/GetAvailableTravelsUseCase';
import { GetTravelByIdUseCase } from '../../../application/use-cases/travel/GetTravelByIdUseCase';
import { RequestTravelUseCase } from '../../../application/use-cases/travel/RequestTravelUseCase';
import { UpdateTravelStatusUseCase } from '../../../application/use-cases/travel/UpdateTravelStatusUseCase';
import { GetMyTravelsUseCase } from '../../../application/use-cases/travel/GetMyTravelsUseCase';
import { CancelTravelUseCase } from '../../../application/use-cases/travel/CancelTravelUseCase';
import { CreateTravelRequestDTO } from '../../../application/dtos/travel/CreateTravelRequestDTO';
import { RequestTravelDTO } from '../../../application/dtos/travel/RequestTravelDTO';
import { TravelFiltersDTO } from '../../../application/dtos/travel/TravelFiltersDTO';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class TravelController {
  constructor(
    private readonly createTravelUseCase: CreateTravelUseCase,
    private readonly getAvailableTravelsUseCase: GetAvailableTravelsUseCase,
    private readonly getTravelByIdUseCase: GetTravelByIdUseCase,
    private readonly requestTravelUseCase: RequestTravelUseCase,
    private readonly updateTravelStatusUseCase: UpdateTravelStatusUseCase,
    private readonly getMyTravelsUseCase: GetMyTravelsUseCase,
    private readonly cancelTravelUseCase: CancelTravelUseCase,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.createTravelUseCase.execute(
      req.user!.id,
      req.body as CreateTravelRequestDTO,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.CREATED, 'Viaje creado correctamente', result.value);
  }

  async list(req: Request, res: Response): Promise<void> {
    const filters = (req.query ?? {}) as TravelFiltersDTO;

    const result = await this.getAvailableTravelsUseCase.execute(
      filters,
      req.user!.id,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Viajes disponibles obtenidos', result.value);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.getTravelByIdUseCase.execute(id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Viaje obtenido correctamente', result.value);
  }

  async request(req: Request, res: Response): Promise<void> {
    const result = await this.requestTravelUseCase.execute(
      req.user!.id,
      req.body as RequestTravelDTO,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(
      res,
      HttpStatus.CREATED,
      'Solicitud de viaje enviada correctamente',
      result.value,
    );
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };

    const result = await this.updateTravelStatusUseCase.execute(
      id,
      req.user!.id,
      status,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Estado del viaje actualizado', result.value);
  }

  async myTravels(req: Request, res: Response): Promise<void> {
    const result = await this.getMyTravelsUseCase.execute(req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Viajes del usuario obtenidos', result.value);
  }

  async cancel(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.cancelTravelUseCase.execute(id, req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Viaje cancelado correctamente');
  }
}
