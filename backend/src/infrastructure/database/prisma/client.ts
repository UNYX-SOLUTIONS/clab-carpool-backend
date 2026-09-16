import { PrismaClient } from '@prisma/client';

import { logger } from '../../../shared/utils/logger';
import { env } from '../../config/env';

export const prisma = new PrismaClient({
  log:
    env.NODE_ENV === 'development'
      ? [
          { level: 'warn', emit: 'event' },
          { level: 'error', emit: 'event' },
        ]
      : [{ level: 'error', emit: 'event' }],
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma warning', { message: e.message });
});

prisma.$on('error', (e) => {
  logger.error('Prisma error', { message: e.message });
});
