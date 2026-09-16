import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { DomainException } from './DomainException';

export class TravelNotFoundException extends DomainException {
  constructor() {
    super(ErrorMessages.TRAVEL_NOT_FOUND, HttpStatus.NOT_FOUND);
    this.name = 'TravelNotFoundException';
  }
}
