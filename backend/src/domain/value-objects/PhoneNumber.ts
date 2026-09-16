import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export class PhoneNumber {
  private constructor(public readonly value: string) {}

  static create(phone: string): Result<PhoneNumber> {
    const normalized = phone.trim();

    if (!PHONE_REGEX.test(normalized)) {
      return Result.fail(
        new ValidationException('Número de teléfono inválido. Debe tener entre 8 y 15 dígitos'),
      );
    }

    return Result.ok(new PhoneNumber(normalized));
  }
}
