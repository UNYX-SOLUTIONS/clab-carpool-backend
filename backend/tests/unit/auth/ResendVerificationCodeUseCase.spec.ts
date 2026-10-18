import { ResendVerificationCodeUseCase } from '../../../src/application/use-cases/auth/ResendVerificationCodeUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { IVerificationCodeIssuer } from '../../../src/application/interfaces/IVerificationCodeIssuer';
import { User } from '../../../src/domain/entities/User';

const makeUser = (isVerified = false) =>
  User.create({
    id: 'user_1',
    email: 'student@espol.edu.ec',
    passwordHash: 'hashed_password',
    fullName: 'Estudiante ESPOL',
    institutionId: 'inst_1',
    isVerified,
    isDriver: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ResendVerificationCodeUseCase', () => {
  const userRepository: jest.Mocked<IUserRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    markVerified: jest.fn(),
    markAsDriver: jest.fn(),
    setPasswordHash: jest.fn(),
    setVerificationCode: jest.fn(),
    clearVerificationCode: jest.fn(),
    getVerificationCode: jest.fn(),
    incrementVerificationCodeAttempts: jest.fn(),
  };

  const verificationCodeIssuer: jest.Mocked<IVerificationCodeIssuer> = {
    issue: jest.fn(),
  };

  const useCase = new ResendVerificationCodeUseCase(
    userRepository,
    verificationCodeIssuer,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder ok sin emitir código cuando el usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute('nadie@espol.edu.ec');

    expect(result.isSuccess).toBe(true);
    expect(verificationCodeIssuer.issue).not.toHaveBeenCalled();
  });

  it('debe responder ok sin emitir código cuando el correo ya está verificado', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser(true));

    const result = await useCase.execute('student@espol.edu.ec');

    expect(result.isSuccess).toBe(true);
    expect(verificationCodeIssuer.issue).not.toHaveBeenCalled();
  });

  it('debe emitir un código sin esperar la entrega para usuarios sin verificar', async () => {
    const user = makeUser(false);
    userRepository.findByEmail.mockResolvedValue(user);
    verificationCodeIssuer.issue.mockResolvedValue(true);

    const result = await useCase.execute('STUDENT@espol.edu.ec');

    expect(result.isSuccess).toBe(true);
    expect(verificationCodeIssuer.issue).toHaveBeenCalledWith(user, false);
  });
});
