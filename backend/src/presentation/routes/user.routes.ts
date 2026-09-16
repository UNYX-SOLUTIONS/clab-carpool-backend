import { Router } from 'express';
import { z } from 'zod';

import { Container } from '../../infrastructure/container';
import { createAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireVerifiedUser } from '../middlewares/institutionVerification';
import { validate } from '../middlewares/validation';
import { updateProfileSchema } from '../validators/user.validator';

const verifyInstitutionSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export function userRoutes(container: Container): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(container.services.authService);
  const { user } = container.controllers;

  router.use(authMiddleware);

  router.get(
    '/profile',
    asyncHandler((req, res) => user.getProfile(req, res)),
  );

  router.put(
    '/profile',
    validate(updateProfileSchema),
    asyncHandler((req, res) => user.updateProfile(req, res)),
  );

  router.get(
    '/:id',
    asyncHandler((req, res) => user.getUserById(req, res)),
  );

  router.post(
    '/verify-institution',
    requireVerifiedUser,
    validate(verifyInstitutionSchema),
    asyncHandler((req, res) => user.verifyInstitution(req, res)),
  );

  return router;
}
