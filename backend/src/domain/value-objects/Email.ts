import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class Email {
  private constructor(public readonly value: string) {}

  static create(email: string): Result<Email> {
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalized)) {
      return Result.fail(new ValidationException('Formato de correo electrónico inválido'));
    }

    return Result.ok(new Email(normalized));
  }

  get domain(): string {
    return this.value.split('@')[1];
  }
}
