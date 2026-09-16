import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { Vehicle } from '../../../domain/entities/Vehicle';
import { PlateNumber } from '../../../domain/value-objects/PlateNumber';
import { IVehicleRepository } from '../../../domain/repositories/IVehicleRepository';
import { RegisterVehicleDTO } from '../../dtos/vehicle/RegisterVehicleDTO';

export class RegisterVehicleUseCase {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async execute(
    userId: string,
    dto: RegisterVehicleDTO,
  ): Promise<Result<Vehicle>> {
    const plateResult = PlateNumber.create(dto.plate);

    if (plateResult.isFailure) {
      return Result.fail(plateResult.error);
    }

    const existingVehicle = await this.vehicleRepository.findByUserId(userId);

    if (existingVehicle) {
      return Result.fail(
        new AppError(
          'VEHICLE_ALREADY_EXISTS',
          ErrorMessages.VEHICLE_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        ),
      );
    }

    const plateExists = await this.vehicleRepository.findByPlate(
      plateResult.value.value,
    );

    if (plateExists) {
      return Result.fail(
        new AppError(
          'PLATE_ALREADY_EXISTS',
          ErrorMessages.PLATE_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        ),
      );
    }

    const vehicle = await this.vehicleRepository.create({
      userId,
      brand: dto.brand.trim(),
      model: dto.model.trim(),
      plate: plateResult.value.value,
      color: dto.color.trim(),
      seats: dto.seats,
    });

    return Result.ok(vehicle);
  }
}
