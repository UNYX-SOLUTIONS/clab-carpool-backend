import { buildContainer } from './infrastructure/container';
import { startServer } from './infrastructure/web/app';

const container = buildContainer();

startServer(container);
