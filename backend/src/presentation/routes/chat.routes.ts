import { Router } from 'express';

import { Container } from '../../infrastructure/container';
import { createAuthMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { requireRole } from '../middlewares/roleVerification';
import { validate } from '../middlewares/validation';
import { sendMessageSchema } from '../validators/chat.validator';

export function chatRoutes(container: Container): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(container.services.authService);
  const { chat } = container.controllers;

  router.use(authMiddleware);

  router.get(
    '/',
    asyncHandler((req, res) => chat.list(req, res)),
  );

  router.get(
    '/active',
    asyncHandler((req, res) => chat.activeChat(req, res)),
  );

  router.get(
    '/:id/messages',
    asyncHandler((req, res) => chat.messages(req, res)),
  );

  router.post(
    '/:id/messages',
    validate(sendMessageSchema),
    asyncHandler((req, res) => chat.sendMessage(req, res)),
  );

  router.post(
    '/:id/pin-request',
    requireRole('driver'),
    asyncHandler((req, res) => chat.requestPin(req, res)),
  );

  return router;
}
