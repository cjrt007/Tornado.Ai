import { registrySize } from '../../mcp/registry/index.js';
import { auditLogStatus } from '../../core/audit/status.js';

export type HealthResponse = {
  status: 'ok';
  registrySize: number;
  lastAuditEvent?: string;
};

export const getHealthStatus = async (): Promise<HealthResponse> => {
  const [size, audit] = await Promise.all([registrySize(), auditLogStatus()]);

  return {
    status: 'ok',
    registrySize: size,
    lastAuditEvent: audit?.lastEventTime
  };
};
