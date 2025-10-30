import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

import { config } from './config/index.js';
import { registerApiRoutes } from './api/routes/index.js';
import { createLogger } from './core/metrics/logger.js';

export const buildServer = (): FastifyInstance => {
  const logger = createLogger(config.logging);
  const app = Fastify({
    logger
  });

  if (config.server.corsEnabled) {
    app.register(cors, { origin: true });
  }

  registerApiRoutes(app);

  return app;
};

if (process.env.NODE_ENV !== 'test') {
  const app = buildServer();
  app
    .listen({ port: config.server.port, host: config.server.host })
    .then(() => {
      app.log.info(
        {
          port: config.server.port,
          host: config.server.host
        },
        'Tornado.ai server running'
      );
    })
    .catch((error) => {
      app.log.error({ err: error }, 'Failed to start server');
      process.exit(1);
    });
}
