import type { FastifyInstance } from 'fastify';

import { getHealthStatus } from '../controllers/health.js';

export const registerHealthRoutes = (app: FastifyInstance): void => {
  app.get('/health', async () => getHealthStatus());
};
