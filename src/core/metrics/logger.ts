import { pino } from 'pino';

import type { AppConfig } from '../../config/index.js';

type LoggingConfig = AppConfig['logging'];

export const createLogger = (logging: LoggingConfig) => {
  if (logging.pretty) {
    return pino({
      level: logging.level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    });
  }

  return pino({ level: logging.level });
};
