import { Result } from '../../../shared/core/Result';
import { UserNotFoundException } from '../../../domain/exceptions/UserNotFoundException';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  institutionId: string;
  institutionName?: string;
  institutionDomain?: string;
  isVerified: boolean;
  isDriver: boolean;
  phone?: string | null;
  photoUrl?: string | null;
  createdAt: Date;
}

export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<Result<UserProfile>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail(new UserNotFoundException());
    }
    return Result.ok({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      institutionId: user.institutionId,
      institutionName: user.institutionName,
      institutionDomain: user.institutionDomain,
      isVerified: user.isVerified,
      isDriver: user.isDriver,
      phone: user.phone,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
    });
  }
}
