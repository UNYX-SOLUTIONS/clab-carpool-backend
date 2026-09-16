import { AppError } from '../../../shared/core/AppError';
import { Result } from '../../../shared/core/Result';
import { ErrorMessages } from '../../../shared/constants/errorMessages';
import { HttpStatus } from '../../../shared/constants/statusCodes';
import { addMinutes } from '../../../shared/utils/dateUtils';
import { PinValidation } from '../../../domain/entities/PinValidation';
import { TravelNotFoundException } from '../../../domain/exceptions/TravelNotFoundException';
import { IPinValidationRepository } from '../../../domain/repositories/IPinValidationRepository';
import { ITravelRepository } from '../../../domain/repositories/ITravelRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPinGenerator } from '../../interfaces/IPinGenerator';
import { IEmailService } from '../../interfaces/IEmailService';

export const PIN_EXPIRATION_MINUTES = 10;

export class RequestPinUseCase {
  constructor(
    private readonly travelRepository: ITravelRepository,
    private readonly pinValidationRepository: IPinValidationRepository,
    private readonly userRepository: IUserRepository,
    private readonly pinGenerator: IPinGenerator,
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    travelId: string,
    driverId: string,
  ): Promise<Result<PinValidation>> {
    const travel = await this.travelRepository.findById(travelId);

    if (!travel) {
      return Result.fail(new TravelNotFoundException());
    }

    if (travel.driverId !== driverId) {
      return Result.fail(
        new AppError(
          'FORBIDDEN',
          ErrorMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        ),
      );
    }

    const existing = await this.pinValidationRepository.findActiveByTravelId(
      travel.id,
    );

    if (existing && !existing.isExpired() && !existing.isUsed) {
      return Result.ok(existing);
    }

    const pin = this.pinGenerator.generate();

    const pinValidation = await this.pinValidationRepository.create({
      userId: driverId,
      travelId: travel.id,
      pin,
      expiresAt: addMinutes(new Date(), PIN_EXPIRATION_MINUTES),
    });

    const driver = await this.userRepository.findById(driverId);

    if (driver) {
      await this.emailService.sendPin(driver.email, driver.fullName, pin);
    }

    return Result.ok(pinValidation);
  }
}
