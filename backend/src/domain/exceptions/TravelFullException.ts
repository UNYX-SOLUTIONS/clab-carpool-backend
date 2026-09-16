import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { DomainException } from './DomainException';

export class TravelFullException extends DomainException {
  constructor() {
    super(ErrorMessages.TRAVEL_FULL, HttpStatus.CONFLICT);
    this.name = 'TravelFullException';
  }
}
