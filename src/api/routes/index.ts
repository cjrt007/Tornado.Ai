import type { FastifyInstance } from 'fastify';

import { registerAuthHandlers } from '../../auth/handlers/auth.js';
import { registerHealthRoutes } from './health.js';

export const registerApiRoutes = (app: FastifyInstance): void => {
  registerAuthHandlers(app);
  registerHealthRoutes(app);
};
