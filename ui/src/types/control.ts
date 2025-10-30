export type FeatureCategory = 'general' | 'auth' | 'mcp' | 'reporting' | 'ui' | 'observability' | 'tools';

export interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  category: FeatureCategory;
  enabled: boolean;
  locked: boolean;
  requiresRestart: boolean;
  tags: string[];
}

export interface RoleControl {
  role: 'admin' | 'pentester' | 'auditor' | 'viewer';
  displayName: string;
  description: string;
  permissions: string[];
  featureAccess: string[];
  defaultLanding: string;
  enforcement: {
    mfaRequired: boolean;
    sessionTimeoutMinutes: number;
  };
}

export type ScanCategory =
  | 'network'
  | 'webapp'
  | 'cloud'
  | 'binary'
  | 'ctf'
  | 'osint'
  | 'compliance'
  | 'hybrid';

export interface ScanGuardrails {
  approvalsRequired: boolean;
  approvalsNeeded: number;
  safeMode: boolean;
  maxParallelTasks: number;
  notifyRoles: RoleControl['role'][];
}

export interface ScanSchedule {
  type: 'manual' | 'scheduled' | 'continuous';
  cron?: string;
  timezone: string;
  maintenanceWindow?: {
    start: string;
    durationMinutes: number;
  };
}

export interface ScanProfile {
  id: string;
  name: string;
  category: ScanCategory;
  description: string;
  targets: string[];
  tooling: string[];
  parameters: Record<string, unknown>;
  tags: string[];
  schedule: ScanSchedule;
  guardrails: ScanGuardrails;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface ControlSurface {
  features: FeatureToggle[];
  roles: RoleControl[];
  scanProfiles: ScanProfile[];
}
