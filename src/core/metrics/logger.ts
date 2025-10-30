import type { FastifyBaseLogger, FastifyServerOptions } from 'fastify';

import type { AppConfig } from '../../config/index.js';

type LoggingConfig = AppConfig['logging'];
type FastifyLoggerConfig = Exclude<NonNullable<FastifyServerOptions['logger']>, boolean | FastifyBaseLogger>;

export const createLogger = (logging: LoggingConfig): FastifyLoggerConfig => {
  if (logging.pretty) {
    return {
      level: logging.level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    } as FastifyLoggerConfig;
  }

  return {
    level: logging.level
  } as FastifyLoggerConfig;
};
