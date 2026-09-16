import bcrypt from 'bcryptjs';

import { IEncryptionService } from '../../../application/interfaces/IEncryptionService';
import { env } from '../../config/env';

export class BcryptService implements IEncryptionService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = env.BCRYPT_SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
