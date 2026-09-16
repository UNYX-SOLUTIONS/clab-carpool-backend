import { Router } from 'express';

import { Container } from '../../infrastructure/container';
import { createAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireRole } from '../middlewares/roleVerification';
import { validate } from '../middlewares/validation';
import {
  createTravelSchema,
  requestTravelSchema,
  travelFiltersSchema,
  updateTravelStatusSchema,
} from '../validators/travel.validator';

export function travelRoutes(container: Container): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(container.services.authService);
  const { travel } = container.controllers;

  router.use(authMiddleware);

  router.post(
    '/',
    requireRole('driver'),
    validate(createTravelSchema),
    asyncHandler((req, res) => travel.create(req, res)),
  );

  router.get(
    '/',
    validate(travelFiltersSchema, 'query'),
    asyncHandler((req, res) => travel.list(req, res)),
  );

  router.get(
    '/my-travels',
    asyncHandler((req, res) => travel.myTravels(req, res)),
  );

  router.get(
    '/:id',
    asyncHandler((req, res) => travel.getById(req, res)),
  );

  router.post(
    '/:id/request',
    validate(requestTravelSchema),
    asyncHandler((req, res) => travel.request(req, res)),
  );

  router.put(
    '/:id/status',
    requireRole('driver'),
    validate(updateTravelStatusSchema),
    asyncHandler((req, res) => travel.updateStatus(req, res)),
  );

  router.delete(
    '/:id',
    requireRole('driver'),
    asyncHandler((req, res) => travel.cancel(req, res)),
  );

  return router;
}
