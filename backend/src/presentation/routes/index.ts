import { Router, Request, Response } from 'express';

import { Container } from '../../infrastructure/container';
import { successResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { travelRoutes } from './travel.routes';
import { chatRoutes } from './chat.routes';
import { ratingRoutes } from './rating.routes';
import { walletRoutes } from './wallet.routes';
import { vehicleRoutes } from './vehicle.routes';

export function apiRoutes(container: Container): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    successResponse(res, HttpStatus.OK, 'CLAB Carpool API operativa', {
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  router.use('/auth', authRoutes(container));
  router.use('/users', userRoutes(container));
  router.use('/travels', travelRoutes(container));
  router.use('/chats', chatRoutes(container));
  router.use('/ratings', ratingRoutes(container));
  router.use('/wallet', walletRoutes(container));
  router.use('/vehicles', vehicleRoutes(container));

  return router;
}
