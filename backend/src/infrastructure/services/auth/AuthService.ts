import { IAuthService, AuthTokenPayload, EmailCodePayload, TokenPair } from '../../../application/interfaces/IAuthService';
import { JwtService } from '../jwt/JwtService';
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
      AuthTokenPayload & { sub: string }
    >(token, this.jwtService.getAccessSecret());

    return {
      userId: payload.sub,
      email: payload.email ?? '',
      role: payload.role ?? 'passenger',
      isDriver: payload.isDriver ?? false,
      isVerified: payload.isVerified ?? false,
    };
  }

  verifyRefreshToken(token: string): AuthTokenPayload {
    const payload = this.jwtService.verify<{ sub: string }>(
      token,
      this.jwtService.getRefreshSecret(),
    );

    return {
      userId: payload.sub,
      email: '',
      role: 'passenger',
      isDriver: false,
      isVerified: false,
    };
  }

  generateEmailVerificationCode(email: string): string {
    return this.jwtService.sign(
      { email, purpose: 'email_verification' },
      this.jwtService.getAccessSecret(),
      env.EMAIL_VERIFICATION_CODE_EXPIRES_IN,
    );
  }

  verifyEmailVerificationCode(token: string): EmailCodePayload {
    const payload = this.jwtService.verify<EmailCodePayload & { purpose: string }>(
      token,
      this.jwtService.getAccessSecret(),
    );

    if (payload.purpose !== 'email_verification') {
      throw new Error('Invalid token purpose');
    }

    return { email: payload.email };
  }
}
