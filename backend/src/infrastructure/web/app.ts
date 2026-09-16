import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { Container } from '../container';
import { apiRoutes } from '../../presentation/routes';
import { errorHandler } from '../../presentation/middlewares/errorHandler';
import { swaggerSpec } from '../../presentation/schemas/swagger';
import { env } from '../config/env';
import { logger, stream } from '../../shared/utils/logger';
import { errorResponse } from '../../shared/utils/responseHandler';
import { HttpStatus } from '../../shared/constants/statusCodes';

export function createApp(container: Container): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((origin: string) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api/v1', apiRoutes(container));

  app.use((_req: Request, res: Response) => {
    errorResponse(res, HttpStatus.NOT_FOUND, 'Ruta no encontrada', 'NOT_FOUND');
  });

  app.use(errorHandler);

  return app;
}

export function startServer(container: Container): void {
  const app = createApp(container);

  const server = app.listen(env.PORT, () => {
    logger.info(`CLAB Carpool API escuchando en el puerto ${env.PORT}`);
    logger.info(`Documentación Swagger disponible en http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} recibido. Cerrando servidor...`);
    server.close(async () => {
      await container.prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}
