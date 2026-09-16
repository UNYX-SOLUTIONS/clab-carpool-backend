import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Vehicle } from '../../../domain/entities/Vehicle';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { RegisterVehicleDTO } from '../../dtos/vehicle/RegisterVehicleDTO';

export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(
    vehicleId: string,
    userId: string,
    dto: Partial<RegisterVehicleDTO>,
  ): Promise<Result<Vehicle>> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      return Result.fail(
        new AppError(
          'VEHICLE_NOT_FOUND',
          ErrorMessages.VEHICLE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    if (vehicle.userId !== userId) {
      return Result.fail(
        new AppError(
          'FORBIDDEN',
          ErrorMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const updated = await this.vehicleRepository.update(vehicleId, {
      brand: dto.brand?.trim(),
      model: dto.model?.trim(),
      plate: dto.plate?.trim().toUpperCase(),
      color: dto.color?.trim(),
      seats: dto.seats,
    });

    return Result.ok(updated);
  }
}
