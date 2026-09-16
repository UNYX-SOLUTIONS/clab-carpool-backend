import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { DomainException } from './DomainException';

export class ValidationException extends DomainException {
  constructor(message: string = ErrorMessages.VALIDATION_ERROR, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = 'ValidationException';
    this.details = details;
  }

  public readonly details?: unknown;
}
