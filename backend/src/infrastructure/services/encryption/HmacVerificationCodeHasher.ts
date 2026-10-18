import { createHmac, timingSafeEqual } from 'node:crypto';

import { IVerificationCodeHasher } from '../../../application/interfaces/IVerificationCodeHasher';
import { env } from '../../config/env';

export class HmacVerificationCodeHasher implements IVerificationCodeHasher {
  private readonly secret: string;

  constructor(secret: string = env.OTP_HASH_SECRET ?? env.JWT_SECRET) {
    this.secret = secret;
  }

  hash(code: string): string {
    return this.digest(code);
  }

  verify(code: string, digest: string): boolean {
    const expected = Buffer.from(this.digest(code), 'hex');
    const provided = Buffer.from(digest, 'hex');

    if (provided.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(expected, provided);
  }

  private digest(code: string): string {
    return createHmac('sha256', this.secret)
      .update(`email-verification:${code}`)
      .digest('hex');
  }
}
