import { User } from '../../domain/entities/User';

export interface IVerificationCodeIssuer {
  issue(user: User, waitForDelivery?: boolean): Promise<boolean>;
}
