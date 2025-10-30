import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const AUDIT_LOG_PATH = resolve('data', 'audit.log.jsonl');

export type AuditLogStatus = {
  lastEventTime?: string;
  entries: number;
};

export const auditLogStatus = async (): Promise<AuditLogStatus> => {
  try {
    const content = await readFile(AUDIT_LOG_PATH, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    const last = lines.at(-1);
    if (!last) {
      return { entries: 0 };
    }

    const parsed = JSON.parse(last) as { timestamp?: string };
    return { entries: lines.length, lastEventTime: parsed.timestamp };
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { entries: 0 };
    }
    throw error;
  }
};
