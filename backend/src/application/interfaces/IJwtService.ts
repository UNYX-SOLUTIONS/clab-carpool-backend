export interface IJwtService {
  sign(payload: object, secret: string, expiresIn: string): string;
  verify<T>(token: string, secret: string): T;
}
