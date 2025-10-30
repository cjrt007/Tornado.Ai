import { pino, type LoggerOptions } from 'pino';
import type { FastifyBaseLogger } from 'fastify';

import type { AppConfig } from '../../config/index.js';

type LoggingConfig = AppConfig['logging'];

const buildOptions = (logging: LoggingConfig): LoggerOptions => ({
  level: logging.level,
  ...(logging.pretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard'
          }
        }
      }
    : {})
});

export const createLogger = (logging: LoggingConfig): FastifyBaseLogger => {
  return pino(buildOptions(logging)) as unknown as FastifyBaseLogger;
};
