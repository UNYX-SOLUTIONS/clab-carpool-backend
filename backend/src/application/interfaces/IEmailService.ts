export interface IEmailService {
  sendVerificationCode(email: string, fullName: string, code: string): Promise<void>;
  sendPin(email: string, fullName: string, pin: string): Promise<void>;
  sendPasswordReset?(email: string, fullName: string, token: string): Promise<void>;
}
