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

export const SecurityToolsCollectionSchema = z.object({
  version: z.string(),
  last_updated: z.string(),
  categories: z.array(
    z.object({
      name: z.string(),
      tool_count: z.number(),
      tools: z.array(
        z.object({
          name: z.string(),
          description: z.string()
        })
      )
    })
  ),
  new_features: z.array(
    z.object({
      name: z.string(),
      description: z.string()
    })
  ),
  statistics: z.object({
    total_categories: z.number(),
    total_tools: z.number(),
    last_verified: z.string()
  })
});

export const FeatureToggleSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  category: z.enum(['general', 'auth', 'mcp', 'reporting', 'ui', 'observability', 'tools']),
  enabled: z.boolean(),
  locked: z.boolean().default(false),
  requiresRestart: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

export const FeatureTogglePatchSchema = z.object({
  id: z.string(),
  enabled: z.boolean().optional(),
  locked: z.boolean().optional()
});

export const RoleControlSchema = z.object({
  role: z.enum(['admin', 'pentester', 'auditor', 'viewer']),
  displayName: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
  featureAccess: z.array(z.string()).default([]),
  defaultLanding: z.string().default('dashboard'),
  enforcement: z.object({
    mfaRequired: z.boolean(),
    sessionTimeoutMinutes: z.number().int().positive()
  })
});

export const RoleControlPatchSchema = z.object({
  role: z.enum(['admin', 'pentester', 'auditor', 'viewer']),
  permissions: z.array(z.string()).optional(),
  featureAccess: z.array(z.string()).optional(),
  defaultLanding: z.string().optional(),
  enforcement: z
    .object({
      mfaRequired: z.boolean().optional(),
      sessionTimeoutMinutes: z.number().int().positive().optional()
    })
    .optional()
});

export const ScanGuardrailSchema = z.object({
  approvalsRequired: z.boolean(),
  approvalsNeeded: z.number().int().min(0).max(5).default(1),
  safeMode: z.boolean(),
  maxParallelTasks: z.number().int().positive(),
  notifyRoles: z.array(z.enum(['admin', 'pentester', 'auditor', 'viewer'])).default([])
});

export const ScanScheduleSchema = z.object({
  type: z.enum(['manual', 'scheduled', 'continuous']),
  cron: z.string().optional(),
  timezone: z.string().default('UTC'),
  maintenanceWindow: z
    .object({
      start: z.string(),
      durationMinutes: z.number().int().positive()
    })
    .optional()
});

export const ScanProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['network', 'webapp', 'cloud', 'binary', 'ctf', 'osint', 'compliance', 'hybrid']),
  description: z.string(),
  targets: z.array(z.string()),
  tooling: z.array(z.string()),
  parameters: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  schedule: ScanScheduleSchema,
  guardrails: ScanGuardrailSchema,
  owner: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const ScanProfilePatchSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  targets: z.array(z.string()).optional(),
  tooling: z.array(z.string()).optional(),
  parameters: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  schedule: ScanScheduleSchema.partial().optional(),
  guardrails: ScanGuardrailSchema.partial().optional()
});

export const ControlSurfaceSchema = z.object({
  features: z.array(FeatureToggleSchema),
  roles: z.array(RoleControlSchema),
  scanProfiles: z.array(ScanProfileSchema)
});

export type ToolSpec = z.infer<typeof ToolSpecSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type User = z.infer<typeof UserSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type SecurityToolsCollection = z.infer<typeof SecurityToolsCollectionSchema>;
export type FeatureToggle = z.infer<typeof FeatureToggleSchema>;
export type FeatureTogglePatch = z.infer<typeof FeatureTogglePatchSchema>;
export type RoleControl = z.infer<typeof RoleControlSchema>;
export type RoleControlPatch = z.infer<typeof RoleControlPatchSchema>;
export type ScanProfile = z.infer<typeof ScanProfileSchema>;
export type ScanProfilePatch = z.infer<typeof ScanProfilePatchSchema>;
export type ControlSurface = z.infer<typeof ControlSurfaceSchema>;
