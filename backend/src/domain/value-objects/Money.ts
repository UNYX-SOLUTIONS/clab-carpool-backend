import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {}

  static create(amount: number, currency: string = 'USD'): Result<Money> {
    if (typeof amount !== 'number' || Number.isNaN(amount) || !Number.isFinite(amount)) {
      return Result.fail(new ValidationException('Monto de dinero inválido'));
    }

    const rounded = Math.round(amount * 100) / 100;

    return Result.ok(new Money(rounded, currency.toUpperCase()));
  }

  add(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail(new ValidationException('No se pueden sumar montos de distinta moneda'));
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail(
        new ValidationException('No se pueden restar montos de distinta moneda'),
      );
    }
    return Money.create(this.amount - other.amount, this.currency);
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.currency === other.currency && this.amount >= other.amount;
  }

  toDecimalString(): string {
    return this.amount.toFixed(2);
  }
}
