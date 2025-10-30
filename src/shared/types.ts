import { z } from 'zod';

export const ToolSpecSchema = z.object({
  id: z.string(),
  category: z.enum(['network', 'webapp', 'cloud', 'binary', 'ctf', 'osint']),
  summary: z.string(),
  inputSchema: z.any(),
  outputSchema: z.any().optional(),
  requiredPermissions: z.array(z.string()),
  estimatedDuration: z.number().nonnegative()
});

export const ToolCallSchema = z.object({
  toolId: z.string(),
  params: z.record(z.any()),
  correlationId: z.string(),
  userId: z.string(),
  approve: z.boolean().default(false)
});

export const AuditEventSchema = z.object({
  timestamp: z.string(),
  actor: z.enum(['mcp', 'api', 'test', 'web']),
  userId: z.string(),
  toolId: z.string(),
  params: z.record(z.any()),
  status: z.enum(['success', 'failure', 'pending']),
  resultRef: z.string().optional(),
  error: z.string().optional(),
  correlationId: z.string()
});

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(['admin', 'pentester', 'auditor', 'viewer']),
  mfaEnabled: z.boolean(),
  mfaSecret: z.string().optional(),
  createdAt: z.string(),
  lastLogin: z.string().optional()
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  checklistId: z.string(),
  category: z.string(),
  testId: z.string(),
  description: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'not_applicable']),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  evidence: z.array(z.string()).default([]),
  notes: z.string(),
  testedBy: z.string(),
  testedDate: z.string().optional()
});

export type ToolSpec = z.infer<typeof ToolSpecSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type User = z.infer<typeof UserSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
