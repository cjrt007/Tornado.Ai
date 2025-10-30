import dotenv from 'dotenv';

export type DatabaseType = 'sqlite' | 'postgres';

dotenv.config();

const bool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const number = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  server: {
    host: process.env.SERVER_HOST ?? '0.0.0.0',
    port: number(process.env.SERVER_PORT, 7700),
    corsEnabled: bool(process.env.CORS_ENABLED, true)
  },
  database: {
    type: (process.env.DATABASE_TYPE as DatabaseType) ?? 'sqlite',
    path: process.env.DATABASE_PATH ?? './data/tornado.db'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change_me',
    jwtExpiry: process.env.JWT_EXPIRY ?? '24h',
    mfaIssuer: process.env.MFA_ISSUER ?? 'Tornado.ai'
  },
  cache: {
    maxSize: number(process.env.CACHE_MAX_SIZE, 1024 * 1024 * 1024),
    defaultTtlSeconds: number(process.env.CACHE_DEFAULT_TTL, 3600)
  },
  tools: {
    maxConcurrent: number(process.env.TOOLS_MAX_CONCURRENT, 5),
    timeoutSeconds: number(process.env.TOOLS_TIMEOUT, 300)
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    pretty: bool(process.env.LOG_PRETTY, true)
  }
} as const;

export type AppConfig = typeof config;
