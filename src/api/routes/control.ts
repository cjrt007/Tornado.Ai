import type { FastifyInstance } from 'fastify';

import {
  getControlSurface,
  updateFeatureSurface,
  updateRoleSurface,
  updateScanSurface
} from '../controllers/control.js';

export const registerControlRoutes = (app: FastifyInstance): void => {
  app.get('/api/control', getControlSurface);
  app.patch('/api/control/features', updateFeatureSurface);
  app.patch('/api/control/roles', updateRoleSurface);
  app.patch('/api/control/scans', updateScanSurface);
};
