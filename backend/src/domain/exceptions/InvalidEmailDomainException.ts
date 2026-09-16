import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { DomainException } from './DomainException';

export class InvalidEmailDomainException extends DomainException {
  constructor() {
    super(ErrorMessages.INVALID_EMAIL_DOMAIN, HttpStatus.FORBIDDEN);
    this.name = 'InvalidEmailDomainException';
  }
}
