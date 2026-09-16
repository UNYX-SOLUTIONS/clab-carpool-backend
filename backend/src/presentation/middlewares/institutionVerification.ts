import { NextFunction, Request, Response } from 'express';

import { errorResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';

export function requireVerifiedUser(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || !req.user.isVerified) {
    errorResponse(
      res,
      HttpStatus.FORBIDDEN,
      ErrorMessages.USER_NOT_VERIFIED,
      'USER_NOT_VERIFIED',
    );
    return;
  }

  next();
}
