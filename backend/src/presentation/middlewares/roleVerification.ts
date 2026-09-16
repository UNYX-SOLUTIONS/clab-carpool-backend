import { NextFunction, Request, Response } from 'express';

import { errorResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';

export function requireRole(role: 'driver' | 'passenger') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, HttpStatus.UNAUTHORIZED, ErrorMessages.UNAUTHORIZED, 'UNAUTHORIZED');
      return;
    }

    if (role === 'driver' && !req.user.isDriver) {
      errorResponse(
        res,
        HttpStatus.FORBIDDEN,
        ErrorMessages.DRIVER_REQUIRED,
        'DRIVER_REQUIRED',
      );
      return;
    }

    next();
  };
}
