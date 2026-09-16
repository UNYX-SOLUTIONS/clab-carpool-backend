import jwt, { SignOptions } from 'jsonwebtoken';

import { IJwtService } from '../../../application/interfaces/IJwtService';
import { env } from '../../config/env';

export class JwtService implements IJwtService {
  private readonly secret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.secret = env.JWT_SECRET;
    this.refreshSecret = env.JWT_REFRESH_SECRET;
  }

  sign(payload: object, secret: string, expiresIn: string): string {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, secret, options);
  }

  verify<T>(token: string, secret: string): T {
    return jwt.verify(token, secret) as T;
  }

  getAccessSecret(): string {
    return this.secret;
  }

  getRefreshSecret(): string {
    return this.refreshSecret;
  }
}
