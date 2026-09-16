import { LoginUseCase } from '../../../src/application/use-cases/auth/LoginUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { IEncryptionService } from '../../../src/application/interfaces/IEncryptionService';
import { IAuthService } from '../../../src/application/interfaces/IAuthService';
import { User } from '../../../src/domain/entities/User';

const makeUser = (overrides: Partial<{ isVerified: boolean; isDriver: boolean }> = {}) =>
  User.create({
    id: 'user_1',
    email: 'student@espol.edu.ec',
    passwordHash: 'hashed_password',
    fullName: 'Estudiante ESPOL',
    institutionId: 'inst_1',
    isVerified: overrides.isVerified ?? true,
    isDriver: overrides.isDriver ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('LoginUseCase', () => {
  const userRepository: jest.Mocked<IUserRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    markVerified: jest.fn(),
    markAsDriver: jest.fn(),
    setPasswordHash: jest.fn(),
  };

  const encryptionService: jest.Mocked<IEncryptionService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const authService: jest.Mocked<IAuthService> = {
    generateTokenPair: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    generateEmailVerificationCode: jest.fn(),
    verifyEmailVerificationCode: jest.fn(),
  };

  const useCase = new LoginUseCase(userRepository, encryptionService, authService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe fallar cuando el usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'nadie@espol.edu.ec',
      password: 'Password1!',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('DOMAIN_ERROR');
    expect(result.error.statusCode).toBe(401);
  });

  it('debe fallar cuando la contraseña es incorrecta', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    encryptionService.compare.mockResolvedValue(false);

    const result = await useCase.execute({
      email: 'student@espol.edu.ec',
      password: 'WrongPassword1!',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.statusCode).toBe(401);
  });

  it('debe fallar cuando el usuario no está verificado', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser({ isVerified: false }));
    encryptionService.compare.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'student@espol.edu.ec',
      password: 'Password1!',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('USER_NOT_VERIFIED');
  });

  it('debe retornar tokens cuando las credenciales son válidas', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    encryptionService.compare.mockResolvedValue(true);
    authService.generateTokenPair.mockReturnValue({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });

    const result = await useCase.execute({
      email: 'STUDENT@espol.edu.ec',
      password: 'Password1!',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.tokens.accessToken).toBe('access_token');
    expect(result.value.user.isVerified).toBe(true);
    expect(authService.generateTokenPair).toHaveBeenCalledWith(
      'user_1',
      expect.objectContaining({ userId: 'user_1' }),
    );
  });
});
