export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  isDriver: boolean;
  isVerified: boolean;
}

export interface IAuthService {
  generateTokenPair(userId: string, userData: Partial<AuthTokenPayload>): TokenPair;
  verifyAccessToken(token: string): AuthTokenPayload;
  verifyRefreshToken(token: string): AuthTokenPayload;
  generateEmailVerificationCode(): string;
}
