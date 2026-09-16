import { User } from '../entities/User';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  institutionId: string;
  phone?: string;
  photoUrl?: string;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<Pick<User, 'fullName' | 'phone' | 'photoUrl'>>): Promise<User>;
  markVerified(id: string): Promise<User>;
  markAsDriver(id: string): Promise<User>;
  setPasswordHash(id: string, passwordHash: string): Promise<void>;
}
