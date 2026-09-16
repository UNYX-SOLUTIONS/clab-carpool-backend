import { Result } from '../../../shared/core/Result';
import { UserNotFoundException } from '../../../domain/exceptions/UserNotFoundException';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UpdateProfileRequestDTO } from '../../dtos/user/UpdateProfileRequestDTO';

export interface UpdateProfileResult {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  photoUrl?: string | null;
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    userId: string,
    dto: UpdateProfileRequestDTO,
  ): Promise<Result<UpdateProfileResult>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail(new UserNotFoundException());
    }

    const updated = await this.userRepository.update(userId, {
      fullName: dto.fullName?.trim(),
      phone: dto.phone?.trim(),
      photoUrl: dto.photoUrl?.trim(),
    });

    return Result.ok({
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phone: updated.phone,
      photoUrl: updated.photoUrl,
    });
  }
}
