import { Router } from 'express';

import { Container } from '../../infrastructure/container';
import { createAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireRole } from '../middlewares/roleVerification';
import { validate } from '../middlewares/validation';
import {
  registerVehicleSchema,
  updateVehicleSchema,
} from '../validators/vehicle.validator';

export function vehicleRoutes(container: Container): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(container.services.authService);
  const { vehicle } = container.controllers;

  router.use(authMiddleware);

  router.post(
    '/',
    requireRole('driver'),
    validate(registerVehicleSchema),
    asyncHandler((req, res) => vehicle.register(req, res)),
  );

  router.get(
    '/my-vehicle',
    requireRole('driver'),
    asyncHandler((req, res) => vehicle.getMyVehicle(req, res)),
  );

  router.put(
    '/:id',
    requireRole('driver'),
    validate(updateVehicleSchema),
    asyncHandler((req, res) => vehicle.update(req, res)),
  );

  return router;
}
