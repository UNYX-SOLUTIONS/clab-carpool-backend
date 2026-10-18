export interface IVerificationCodeHasher {
  hash(code: string): string;
  verify(code: string, digest: string): boolean;
}
