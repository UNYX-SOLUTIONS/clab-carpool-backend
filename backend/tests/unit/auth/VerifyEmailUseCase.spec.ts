import { VerifyEmailUseCase } from '../../../src/application/use-cases/auth/VerifyEmailUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { IEncryptionService } from '../../../src/application/interfaces/IEncryptionService';
import { User } from '../../../src/domain/entities/User';

const makeUser = (overrides: Partial<{ isVerified: boolean }> = {}) =>
  User.create({
    id: 'user_1',
    email: 'student@espol.edu.ec',
    passwordHash: 'hashed_password',
    fullName: 'Estudiante ESPOL',
    institutionId: 'inst_1',
    isVerified: overrides.isVerified ?? false,
    isDriver: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('VerifyEmailUseCase', () => {
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
  };

  const encryptionService: jest.Mocked<IEncryptionService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const useCase = new VerifyEmailUseCase(userRepository, encryptionService);

  const dto = {
    email: 'student@espol.edu.ec',
    code: '123456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe fallar cuando el usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('DOMAIN_ERROR');
    expect(result.error.statusCode).toBe(404);
  });

  it('debe fallar cuando el correo ya fue verificado', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser({ isVerified: true }));

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('ALREADY_VERIFIED');
    expect(result.error.statusCode).toBe(409);
  });

  it('debe fallar cuando no existe un código pendiente', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    userRepository.getVerificationCode.mockResolvedValue(null);

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('INVALID_VERIFICATION_CODE');
  });

  it('debe fallar y limpiar el código cuando expiró', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    userRepository.getVerificationCode.mockResolvedValue({
      codeHash: 'code_hash',
      expiresAt: new Date(Date.now() - 60_000),
    });

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('INVALID_VERIFICATION_CODE');
    expect(userRepository.clearVerificationCode).toHaveBeenCalledWith('user_1');
    expect(userRepository.markVerified).not.toHaveBeenCalled();
  });

  it('debe fallar cuando el código no coincide', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    userRepository.getVerificationCode.mockResolvedValue({
      codeHash: 'code_hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    encryptionService.compare.mockResolvedValue(false);

    const result = await useCase.execute(dto);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('INVALID_VERIFICATION_CODE');
    expect(userRepository.markVerified).not.toHaveBeenCalled();
  });

  it('debe verificar el correo y limpiar el código usado', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    userRepository.getVerificationCode.mockResolvedValue({
      codeHash: 'code_hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    encryptionService.compare.mockResolvedValue(true);
    userRepository.markVerified.mockResolvedValue(makeUser({ isVerified: true }));

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.value.isVerified).toBe(true);
    expect(userRepository.markVerified).toHaveBeenCalledWith('user_1');
    expect(userRepository.clearVerificationCode).toHaveBeenCalledWith('user_1');
  });
});
