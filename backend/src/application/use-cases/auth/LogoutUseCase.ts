import { Result } from '../../../shared/core/Result';

export class LogoutUseCase {
  async execute(_userId: string): Promise<Result<void>> {
    return Result.ok();
  }
}
