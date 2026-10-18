import { IAuthService, AuthTokenPayload, TokenPair } from '../../../application/interfaces/IAuthService';
import { JwtService } from '../jwt/JwtService';
import { generateRandomDigits } from '../../../shared/utils/stringUtils';
import { EMAIL_VERIFICATION_CODE_LENGTH } from '../../../shared/constants/authConstants';
import { env } from '../../config/env';

export class AuthService implements IAuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateTokenPair(
    userId: string,
    userData: Partial<AuthTokenPayload>,
  ): TokenPair {
    const payload = {
      sub: userId,
      ...userData,
    };

    return {
      accessToken: this.jwtService.sign(
        payload,
        this.jwtService.getAccessSecret(),
        env.JWT_ACCESS_EXPIRES_IN,
      ),
      refreshToken: this.jwtService.sign(
        { sub: userId },
        this.jwtService.getRefreshSecret(),
        env.JWT_REFRESH_EXPIRES_IN,
      ),
    };
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    const payload = this.jwtService.verify<
      AuthTokenPayload & { sub?: unknown }
    >(token, this.jwtService.getAccessSecret());

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new Error('Invalid access token payload: missing subject');
    }

    return {
      userId: payload.sub,
      email: payload.email ?? '',
      role: payload.role ?? 'passenger',
      isDriver: payload.isDriver ?? false,
      isVerified: payload.isVerified ?? false,
    };
  }

  verifyRefreshToken(token: string): AuthTokenPayload {
    const payload = this.jwtService.verify<{ sub?: unknown }>(
      token,
      this.jwtService.getRefreshSecret(),
    );

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new Error('Invalid refresh token payload: missing subject');
    }

    return {
      userId: payload.sub,
      email: '',
      role: 'passenger',
      isDriver: false,
      isVerified: false,
    };
  }

  generateEmailVerificationCode(): string {
    return generateRandomDigits(EMAIL_VERIFICATION_CODE_LENGTH);
  }
}
