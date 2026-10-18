import { Router } from 'express';

import { Container } from '../../infrastructure/container';
import { asyncHandler } from '../middlewares/asyncHandler';

export function institutionRoutes(container: Container): Router {
  const router = Router();
  const { institution } = container.controllers;

  router.get(
    '/',
    asyncHandler((req, res) => institution.list(req, res)),
  );

  return router;
}
