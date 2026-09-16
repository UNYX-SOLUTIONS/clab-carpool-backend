import { NextFunction, Request, Response } from 'express';

import { IAuthService } from '../../application/interfaces/IAuthService';
import { errorResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';

export function createAuthMiddleware(authService: IAuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(
        res,
        HttpStatus.UNAUTHORIZED,
        ErrorMessages.UNAUTHORIZED,
        'MISSING_TOKEN',
      );
      return;
    }

    const token = authHeader.slice(7);

    try {
      const payload = authService.verifyAccessToken(token);

      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        isDriver: payload.isDriver,
        isVerified: payload.isVerified,
      };

      next();
    } catch {
      errorResponse(
        res,
        HttpStatus.UNAUTHORIZED,
        ErrorMessages.INVALID_OR_EXPIRED_TOKEN,
        'INVALID_TOKEN',
      );
    }
  };
}
