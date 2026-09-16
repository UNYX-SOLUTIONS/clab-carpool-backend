import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Travel } from '../../../domain/entities/Travel';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { CreateTravelRequestDTO } from '../../dtos/travel/CreateTravelRequestDTO';

export class CreateTravelUseCase {
  constructor(
    private readonly travelRepository: ITravelRepository,
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    driverId: string,
    dto: CreateTravelRequestDTO,
  ): Promise<Result<Travel>> {
    const departureTime = new Date(dto.departureTime);

    if (Number.isNaN(departureTime.getTime())) {
      return Result.fail(
        new AppError(
          'VALIDATION_ERROR',
          'La fecha de salida no es válida',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    if (departureTime.getTime() < Date.now()) {
      return Result.fail(
        new AppError(
          'VALIDATION_ERROR',
          'La hora de salida debe ser en el futuro',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    if (dto.pricePerSeat < 0) {
      return Result.fail(
        new AppError(
          'VALIDATION_ERROR',
          'El precio por asiento no puede ser negativo',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    if (dto.availableSeats < 1) {
      return Result.fail(
        new AppError(
          'VALIDATION_ERROR',
          'Debe haber al menos un asiento disponible',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    const vehicle = await this.vehicleRepository.findById(dto.vehicleId);

    if (!vehicle) {
      return Result.fail(
        new AppError(
          'VEHICLE_NOT_FOUND',
          ErrorMessages.VEHICLE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    if (vehicle.userId !== driverId) {
      return Result.fail(
        new AppError(
          'FORBIDDEN',
          ErrorMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const travel = await this.travelRepository.create({
      driverId,
      vehicleId: vehicle.id,
      origin: dto.origin.trim(),
      destination: dto.destination.trim(),
      departureTime,
      availableSeats: Math.min(dto.availableSeats, vehicle.seats),
      pricePerSeat: Math.round(dto.pricePerSeat * 100) / 100,
    });

    return Result.ok(travel);
  }
}
