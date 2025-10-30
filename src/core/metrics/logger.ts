import pino, { type LoggerOptions } from 'pino';
import type { FastifyBaseLogger } from 'fastify';

import type { AppConfig } from '../../config/index.js';

type LoggingConfig = AppConfig['logging'];

const buildPino = pino as unknown as (options: LoggerOptions) => FastifyBaseLogger;

export const createLogger = (logging: LoggingConfig): FastifyBaseLogger => {
  const options: LoggerOptions = {
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
  };

  return buildPino(options);
};
