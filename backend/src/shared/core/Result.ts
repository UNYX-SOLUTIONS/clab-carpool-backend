import { AppError } from './AppError';

export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value: T | undefined,
    private readonly _error: AppError | undefined,
  ) {}

  static ok<T>(value?: T): Result<T> {
    return new Result<T>(true, value, undefined);
  }

  static fail<T>(error: AppError): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot access value of a failed result');
    }
    return this._value as T;
  }

  get error(): AppError {
    if (this._isSuccess) {
      throw new Error('Cannot access error of a successful result');
    }
    return this._error as AppError;
  }
}
