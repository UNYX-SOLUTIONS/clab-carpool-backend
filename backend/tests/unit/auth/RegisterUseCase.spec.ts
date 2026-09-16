import { RegisterUseCase } from '../../../src/application/use-cases/auth/RegisterUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { IInstitutionRepository } from '../../../src/domain/repositories/IInstitutionRepository';
import { IWalletRepository } from '../../../src/domain/repositories/IWalletRepository';
import { IEncryptionService } from '../../../src/application/interfaces/IEncryptionService';
import { IEmailService } from '../../../src/application/interfaces/IEmailService';
import { IAuthService } from '../../../src/application/interfaces/IAuthService';
import { User } from '../../../src/domain/entities/User';
import { Institution } from '../../../src/domain/entities/Institution';
import { Wallet } from '../../../src/domain/entities/Wallet';

describe('RegisterUseCase', () => {
  const userRepository: jest.Mocked<IUserRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    markVerified: jest.fn(),
    markAsDriver: jest.fn(),
    setPasswordHash: jest.fn(),
  };

  const institutionRepository: jest.Mocked<IInstitutionRepository> = {
    findById: jest.fn(),
    findByDomain: jest.fn(),
    findAllActive: jest.fn(),
  };

  const walletRepository: jest.Mocked<IWalletRepository> = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    getOrCreate: jest.fn(),
    updateBalance: jest.fn(),
    recharge: jest.fn(),
  };

  const encryptionService: jest.Mocked<IEncryptionService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const emailService: jest.Mocked<IEmailService> = {
    sendVerificationCode: jest.fn(),
    sendPin: jest.fn(),
  };

  const authService: jest.Mocked<IAuthService> = {
    generateTokenPair: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    generateEmailVerificationCode: jest.fn(),
    verifyEmailVerificationCode: jest.fn(),
  };

  const useCase = new RegisterUseCase(
    userRepository,
    institutionRepository,
    walletRepository,
    encryptionService,
    emailService,
    authService,
  );

  const institution = Institution.create({
    id: 'inst_1',
    name: 'ESPOL',
    domain: 'espol.edu.ec',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const validDto = {
    email: 'nuevo@espol.edu.ec',
    password: 'Password1!',
    fullName: 'Nuevo Estudiante',
    institutionId: 'inst_1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe fallar cuando el correo ya está registrado', async () => {
    userRepository.findByEmail.mockResolvedValue(
      User.create({
        id: 'user_exists',
        email: 'nuevo@espol.edu.ec',
        passwordHash: 'hash',
        fullName: 'Nuevo Estudiante',
        institutionId: 'inst_1',
        isVerified: false,
        isDriver: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('USER_ALREADY_EXISTS');
  });

  it('debe fallar cuando la institución no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    institutionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(validDto);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('INSTITUTION_NOT_FOUND');
  });

  it('debe fallar cuando el dominio del correo no coincide con la institución', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    institutionRepository.findById.mockResolvedValue(institution);

    const result = await useCase.execute({
      ...validDto,
      email: 'estudiante@gmail.com',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('INVALID_EMAIL_DOMAIN');
  });

  it('debe registrar al usuario, crear monedero y enviar código de verificación', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    institutionRepository.findById.mockResolvedValue(institution);
    encryptionService.hash.mockResolvedValue('hashed_password');
    authService.generateEmailVerificationCode.mockReturnValue('VERIFICATION_CODE');
    userRepository.create.mockResolvedValue(
      User.create({
        id: 'user_new',
        email: 'nuevo@espol.edu.ec',
        passwordHash: 'hashed_password',
        fullName: 'Nuevo Estudiante',
        institutionId: 'inst_1',
        isVerified: false,
        isDriver: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    walletRepository.create.mockResolvedValue(
      Wallet.create({
        id: 'wallet_1',
        userId: 'user_new',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(validDto);

    expect(result.isSuccess).toBe(true);
    expect(result.value.verificationCodeSent).toBe(true);
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'nuevo@espol.edu.ec',
        institutionId: 'inst_1',
      }),
    );
    expect(walletRepository.create).toHaveBeenCalledWith('user_new');
    expect(emailService.sendVerificationCode).toHaveBeenCalledWith(
      'nuevo@espol.edu.ec',
      'Nuevo Estudiante',
      'VERIFICATION_CODE',
    );
  });
});
