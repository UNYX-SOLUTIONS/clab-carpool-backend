import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { DomainException } from './DomainException';

export class UserNotFoundException extends DomainException {
  constructor() {
    super(ErrorMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.name = 'UserNotFoundException';
  }
}
