import { Router } from 'express';

import { Container } from '../../infrastructure/container';
import { createAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { rateLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validation';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendCodeSchema,
  refreshSchema,
} from '../validators/auth.validator';
import { env } from '../../infrastructure/config/env';

export function authRoutes(container: Container): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(container.services.authService);
  const { auth } = container.controllers;

  const loginLimiter = rateLimiter({
    windowMs: env.RATE_LIMIT_LOGIN_WINDOW_MS,
    max: env.RATE_LIMIT_LOGIN_MAX,
    keyPrefix: 'login',
  });

  const verifyLimiter = rateLimiter({
    windowMs: env.RATE_LIMIT_VERIFY_WINDOW_MS,
    max: env.RATE_LIMIT_VERIFY_MAX,
    keyPrefix: 'verify-email',
  });

  router.post(
    '/login',
    loginLimiter,
    validate(loginSchema),
    asyncHandler((req, res) => auth.login(req, res)),
  );

  router.post(
    '/register',
    validate(registerSchema),
    asyncHandler((req, res) => auth.register(req, res)),
  );

  router.post(
    '/verify-email',
    verifyLimiter,
    validate(verifyEmailSchema),
    asyncHandler((req, res) => auth.verifyEmail(req, res)),
  );

  router.post(
    '/resend-code',
    validate(resendCodeSchema),
    asyncHandler((req, res) => auth.resendCode(req, res)),
  );

  router.post(
    '/logout',
    authMiddleware,
    asyncHandler((req, res) => auth.logout(req, res)),
  );

  router.post(
    '/refresh',
    validate(refreshSchema),
    asyncHandler((req, res) => auth.refresh(req, res)),
  );

  return router;
}
