import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { DomainException } from './DomainException';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super(ErrorMessages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    this.name = 'InvalidCredentialsException';
  }
}
