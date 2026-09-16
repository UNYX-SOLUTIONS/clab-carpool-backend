import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

import { errorResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      errorResponse(
        res,
        HttpStatus.UNPROCESSABLE_ENTITY,
        ErrorMessages.VALIDATION_ERROR,
        'VALIDATION_ERROR',
        result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      );
      return;
    }

    if (source === 'body') {
      req.body = result.data;
    } else if (source === 'query') {
      req.query = result.data as typeof req.query;
    } else {
      req.params = result.data as typeof req.params;
    }

    next();
  };
}
