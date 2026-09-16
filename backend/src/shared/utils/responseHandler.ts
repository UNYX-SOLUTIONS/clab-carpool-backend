import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: unknown;
}

export function successResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): Response {
  const body: ApiResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  error?: string,
  details?: unknown,
): Response {
  const body: ApiResponse<never> = {
    success: false,
    message,
  };

  if (error !== undefined) {
    body.error = error;
  }

  if (details !== undefined) {
    body.details = details;
  }

  return res.status(statusCode).json(body);
}
