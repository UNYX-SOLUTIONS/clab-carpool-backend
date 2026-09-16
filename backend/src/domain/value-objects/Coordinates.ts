import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

export class Coordinates {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}

  static create(latitude: number, longitude: number): Result<Coordinates> {
    if (latitude < -90 || latitude > 90) {
      return Result.fail(
        new ValidationException('Latitud inválida. Debe estar entre -90 y 90'),
      );
    }

    if (longitude < -180 || longitude > 180) {
      return Result.fail(
        new ValidationException('Longitud inválida. Debe estar entre -180 y 180'),
      );
    }

    return Result.ok(new Coordinates(latitude, longitude));
  }

  toArray(): [number, number] {
    return [this.latitude, this.longitude];
  }
}
