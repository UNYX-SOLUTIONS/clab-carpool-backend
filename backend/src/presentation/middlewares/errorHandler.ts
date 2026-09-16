import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../../shared/core/AppError';
import { errorResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';
import { ErrorMessages } from '../../shared/constants/errorMessages';
import { logger } from '../../shared/utils/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    errorResponse(res, err.statusCode, err.message, err.code);
    return;
  }

  if (err instanceof ZodError) {
    errorResponse(
      res,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorMessages.VALIDATION_ERROR,
      'VALIDATION_ERROR',
      err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    );
    return;
  }

  if (err instanceof SyntaxError) {
    errorResponse(
      res,
      HttpStatus.BAD_REQUEST,
      'JSON inválido en el cuerpo de la petición',
      'INVALID_JSON',
    );
    return;
  }

  const prismaError = err as { code?: string };

  if (prismaError.code === 'P2025') {
    errorResponse(
      res,
      HttpStatus.NOT_FOUND,
      'Registro no encontrado',
      'NOT_FOUND',
    );
    return;
  }

  if (prismaError.code === 'P2002') {
    errorResponse(
      res,
      HttpStatus.CONFLICT,
      'El registro ya existe',
      'ALREADY_EXISTS',
    );
    return;
  }

  if (prismaError.code?.startsWith('P10')) {
    logger.error('Error de conexión con la base de datos', { error: err });
    errorResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Error de conexión con la base de datos',
      'DATABASE_UNAVAILABLE',
    );
    return;
  }

  logger.error('Error no controlado', { error: err });

  errorResponse(
    res,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorMessages.INTERNAL_SERVER_ERROR,
    'INTERNAL_SERVER_ERROR',
  );
}
