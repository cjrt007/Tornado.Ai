import pino, { type LoggerOptions } from 'pino';
import type { FastifyBaseLogger } from 'fastify';

import type { AppConfig } from '../../config/index.js';

type LoggingConfig = AppConfig['logging'];
type FastifyLoggerConfig = NonNullable<FastifyServerOptions['logger']>;

type LoggerConfigShape = {
  level: string;
  transport?: {
    target: string;
    options?: {
      colorize?: boolean;
      translateTime?: string;
    };
  };
};

const toFastifyLoggerConfig = (options: LoggerConfigShape): FastifyLoggerConfig => {
  return options as unknown as FastifyLoggerConfig;
};

export const createLogger = (logging: LoggingConfig): FastifyLoggerConfig => {
  const baseConfig: LoggerConfigShape = { level: logging.level };

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
