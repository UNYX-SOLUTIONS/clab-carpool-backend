import { Router } from 'express';

import { Container } from '../../infrastructure/container';
import { createAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validation';
import { rateTripSchema } from '../validators/rating.validator';

export function ratingRoutes(container: Container): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(container.services.authService);
  const { rating } = container.controllers;

  router.use(authMiddleware);

  router.post(
    '/',
    validate(rateTripSchema),
    asyncHandler((req, res) => rating.rate(req, res)),
  );

  router.get(
    '/user/:userId',
    asyncHandler((req, res) => rating.listByUser(req, res)),
  );

  return router;
}
