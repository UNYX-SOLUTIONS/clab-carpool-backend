import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

const PLATE_REGEX = /^[A-Za-z]{3}-?\d{3,4}$/;

export class PlateNumber {
  private constructor(public readonly value: string) {}

  static create(plate: string): Result<PlateNumber> {
    const normalized = plate.trim().toUpperCase().replace(/\s+/g, '');

    if (!PLATE_REGEX.test(normalized)) {
      return Result.fail(
        new ValidationException('Placa inválida. Formato esperado: ABC-123 o ABC-1234'),
      );
    }

    return Result.ok(new PlateNumber(normalized));
  }
}
