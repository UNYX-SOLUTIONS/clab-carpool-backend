import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { DomainException } from './DomainException';

export class UnauthorizedException extends DomainException {
  constructor(message: string = ErrorMessages.UNAUTHORIZED) {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'UnauthorizedException';
  }
}
