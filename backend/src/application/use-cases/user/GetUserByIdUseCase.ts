import { Result } from '../../../shared/core/Result';
import { UserNotFoundException } from '../../../domain/exceptions/UserNotFoundException';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface PublicUser {
  id: string;
  fullName: string;
  photoUrl?: string | null;
  isDriver: boolean;
  isVerified: boolean;
  institutionName?: string;
}

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<Result<PublicUser>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail(new UserNotFoundException());
    }

    return Result.ok({
      id: user.id,
      fullName: user.fullName,
      photoUrl: user.photoUrl,
      isDriver: user.isDriver,
      isVerified: user.isVerified,
      institutionName: user.institutionName,
    });
  }
}
