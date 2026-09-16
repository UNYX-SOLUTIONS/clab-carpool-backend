import { Request, Response } from 'express';

import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';
import { VerifyEmailUseCase } from '../../../application/use-cases/auth/VerifyEmailUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { IAuthService } from '../../../application/interfaces/IAuthService';
import { IEmailService } from '../../../application/interfaces/IEmailService';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { LoginRequestDTO } from '../../../application/dtos/auth/LoginRequestDTO';
import { RegisterRequestDTO } from '../../../application/dtos/auth/RegisterRequestDTO';
import { VerifyEmailRequestDTO } from '../../../application/dtos/auth/VerifyEmailRequestDTO';
import { normalizeEmail } from '../../../shared/utils/stringUtils';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
    private readonly emailService: IEmailService,
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    const result = await this.loginUseCase.execute(req.body as LoginRequestDTO);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Inicio de sesión correcto', result.value);
  }

  async register(req: Request, res: Response): Promise<void> {
    const result = await this.registerUseCase.execute(req.body as RegisterRequestDTO);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(
      res,
      HttpStatus.CREATED,
      'Usuario registrado. Revisa tu correo institucional para verificar tu cuenta.',
      result.value,
    );
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const result = await this.verifyEmailUseCase.execute(
      req.body as VerifyEmailRequestDTO,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Correo verificado correctamente', result.value);
  }

  async resendCode(req: Request, res: Response): Promise<void> {
    const email = normalizeEmail((req.body as { email: string }).email);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      errorResponse(
        res,
        HttpStatus.NOT_FOUND,
        'Usuario no encontrado',
        'USER_NOT_FOUND',
      );
      return;
    }

    if (user.isVerified) {
      errorResponse(
        res,
        HttpStatus.CONFLICT,
        'El correo ya fue verificado',
        'ALREADY_VERIFIED',
      );
      return;
    }

    const code = this.authService.generateEmailVerificationCode(user.email);
    await this.emailService.sendVerificationCode(user.email, user.fullName, code);

    successResponse(res, HttpStatus.OK, 'Código de verificación reenviado');
  }

  async logout(req: Request, res: Response): Promise<void> {
    const result = await this.logoutUseCase.execute(req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Sesión cerrada correctamente');
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken: string };

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Token refrescado correctamente', result.value);
  }
}
