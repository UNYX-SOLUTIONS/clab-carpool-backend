import { NextFunction, Request, Response } from 'express';

import { errorResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

export function rateLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown';
    const key = `${options.keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (entry.count >= options.max) {
      errorResponse(
        res,
        HttpStatus.TOO_MANY_REQUESTS,
        'Demasiados intentos. Inténtalo de nuevo más tarde.',
        'RATE_LIMIT_EXCEEDED',
      );
      return;
    }

    entry.count += 1;
    next();
  };
}

export function clearRateLimitBuckets(): void {
  buckets.clear();
}
