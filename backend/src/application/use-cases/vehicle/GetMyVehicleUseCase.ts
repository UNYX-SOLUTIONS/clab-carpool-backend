import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Vehicle } from '../../../domain/entities/Vehicle';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';

export class GetMyVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(userId: string): Promise<Result<Vehicle | null>> {
    const vehicle = await this.vehicleRepository.findByUserId(userId);

    if (!vehicle) {
      return Result.fail(
        new AppError(
          'VEHICLE_NOT_FOUND',
          ErrorMessages.VEHICLE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        ),
      );
    }

    return Result.ok(vehicle);
  }
}
