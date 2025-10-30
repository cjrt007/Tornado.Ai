import type { FastifyReply, FastifyRequest } from 'fastify';

import { hasPermission, type Permission, type Role } from '../../core/policy/rbac.js';

type RequestWithUser = FastifyRequest & {
  user?: {
    id: string;
    role: Role;
  };
};

export const requirePermission = (permission: Permission) => {
  return async (request: RequestWithUser, reply: FastifyReply) => {
    const role = request.user?.role;
    if (!role || !hasPermission(role, permission)) {
      reply.code(403);
      return { error: 'forbidden', message: 'Insufficient permissions' };
    }
  };
};
