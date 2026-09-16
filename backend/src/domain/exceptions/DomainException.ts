import { AppError } from '../../shared/core/AppError';

export class DomainException extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super('DOMAIN_ERROR', message, statusCode);
    this.name = 'DomainException';
  }
}
