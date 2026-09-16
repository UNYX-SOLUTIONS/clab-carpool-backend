import { Router } from 'express';

import { Container } from '../../infrastructure/container';
import { createAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validation';
import { rechargeSchema } from '../validators/wallet.validator';

export function walletRoutes(container: Container): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(container.services.authService);
  const { wallet } = container.controllers;

  router.use(authMiddleware);

  router.get(
    '/',
    asyncHandler((req, res) => wallet.getBalance(req, res)),
  );

  router.post(
    '/recharge',
    validate(rechargeSchema),
    asyncHandler((req, res) => wallet.recharge(req, res)),
  );

  router.get(
    '/transactions',
    asyncHandler((req, res) => wallet.transactions(req, res)),
  );

  return router;
}
