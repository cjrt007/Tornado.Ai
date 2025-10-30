import crypto from 'node:crypto';

import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';

import { config } from '../../config/index.js';
import type { User } from '../../shared/types.js';

const SALT_ROUNDS = 10;

export type AuthPayload = {
  id: string;
  username: string;
  role: User['role'];
};

type FastifyInstanceWithJwt = FastifyInstance & {
  jwt: {
    sign: (payload: AuthPayload) => string;
  };
};

export const registerAuthHandlers = (app: FastifyInstance): void => {
  app.register(fastifyJwt, {
    secret: config.auth.jwtSecret,
    sign: {
      expiresIn: config.auth.jwtExpiry
    }
  });

  app.post('/api/auth/register', async (request, reply) => {
    const body = (request.body ?? {}) as Partial<User>;
    const password = body.passwordHash;
    if (!body.username || !body.email || !password) {
      reply.code(400);
      return { error: 'invalid_request' };
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const token = (app as FastifyInstanceWithJwt).jwt.sign({
      id: body.id ?? crypto.randomUUID(),
      username: body.username,
      role: body.role ?? 'viewer'
    });
    return { token, passwordHash: hash };
  });
};
