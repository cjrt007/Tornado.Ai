import {
  ControlSurfaceSchema,
  FeatureToggleSchema,
  RoleControlSchema,
  ScanProfileSchema,
  type ControlSurface,
  type FeatureToggle,
  type FeatureTogglePatch,
  type RoleControl,
  type RoleControlPatch,
  type ScanProfile,
  type ScanProfilePatch
} from '../../shared/types.js';

const timestamp = () => new Date().toISOString();

const DEFAULT_FEATURES: FeatureToggle[] = [
  {
    id: 'ai.orchestration',
    label: 'AI Orchestration Engine',
    description: 'Enable the multi-agent orchestration layer for automated campaign execution.',
    category: 'general',
    enabled: true,
    locked: false,
    requiresRestart: false,
    tags: ['orchestration', 'agents']
  },
  {
    id: 'ui.advanced-controls',
    label: 'Advanced UI Control Surface',
    description: 'Expose Nessus-style orchestration controls in the web console.',
    category: 'ui',
    enabled: true,
    locked: false,
    requiresRestart: false,
    tags: ['ui', 'control']
  },
  {
    id: 'mcp.streaming-results',
    label: 'MCP Streaming Results',
    description: 'Stream MCP tool execution events to the client UI for live telemetry.',
    category: 'mcp',
    enabled: true,
    locked: false,
    requiresRestart: false,
    tags: ['mcp']
  },
  {
    id: 'reporting.auto-publish',
    label: 'Auto Publish Reports',
    description: 'Automatically publish completed reports to the reporting center.',
    category: 'reporting',
    enabled: false,
    locked: false,
    requiresRestart: false,
    tags: ['reports']
  },
  {
    id: 'observability.deep-metrics',
    label: 'Advanced Metrics Collection',
    description: 'Collect extended telemetry, histograms, and traces for all tool executions.',
    category: 'observability',
    enabled: true,
    locked: false,
    requiresRestart: false,
    tags: ['metrics']
  }
];

const DEFAULT_ROLES: RoleControl[] = [
  {
    role: 'admin',
    displayName: 'Administrator',
    description: 'Full platform access with override privileges.',
    permissions: ['*'],
    featureAccess: DEFAULT_FEATURES.map((feature) => feature.id),
    defaultLanding: 'dashboard',
    enforcement: {
      mfaRequired: true,
      sessionTimeoutMinutes: 30
    }
  },
  {
    role: 'pentester',
    displayName: 'Offensive Operator',
    description: 'Execute tooling, manage scans, and access findings.',
    permissions: ['execute_tools', 'manage_scans', 'view_reports'],
    featureAccess: ['ai.orchestration', 'ui.advanced-controls', 'mcp.streaming-results'],
    defaultLanding: 'operations',
    enforcement: {
      mfaRequired: true,
      sessionTimeoutMinutes: 30
    }
  },
  {
    role: 'auditor',
    displayName: 'Audit & Compliance',
    description: 'Read-only access to reports, dashboards, and compliance scans.',
    permissions: ['view_reports', 'view_dashboards'],
    featureAccess: ['observability.deep-metrics'],
    defaultLanding: 'reports',
    enforcement: {
      mfaRequired: true,
      sessionTimeoutMinutes: 60
    }
  },
  {
    role: 'viewer',
    displayName: 'Stakeholder',
    description: 'Limited dashboard access for stakeholders and clients.',
    permissions: ['view_dashboards'],
    featureAccess: ['observability.deep-metrics'],
    defaultLanding: 'dashboard',
    enforcement: {
      mfaRequired: false,
      sessionTimeoutMinutes: 120
    }
  }
];

const DEFAULT_SCAN_PROFILES: ScanProfile[] = [
  {
    id: 'scan.network.weekly',
    name: 'Weekly Network Recon',
    category: 'network',
    description: 'Recurring internal and external network mapping with safe concurrency.',
    targets: ['10.0.0.0/24', 'corp.example.com'],
    tooling: ['nmap_scan.sim', 'masscan_scan.sim', 'autorecon_scan.sim'],
    parameters: {
      nmap_scan: { intensity: 'med', scripts: ['vuln'] },
      masscan_scan: { rate: 2000 },
      autorecon_scan: { profile: 'network-default' }
    },
    tags: ['baseline', 'scheduled'],
    schedule: {
      type: 'scheduled',
      cron: '0 2 * * 1',
      timezone: 'UTC',
      maintenanceWindow: {
        start: '02:00',
        durationMinutes: 180
      }
    },
    guardrails: {
      approvalsRequired: true,
      approvalsNeeded: 1,
      safeMode: true,
      maxParallelTasks: 3,
      notifyRoles: ['admin', 'pentester']
    },
    owner: 'admin',
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'scan.webapp.critical',
    name: 'Critical Web Applications',
    category: 'webapp',
    description: 'Continuous coverage for production web applications with attack chain guardrails.',
    targets: ['https://app.example.com', 'https://api.example.com'],
    tooling: ['nuclei_scan.sim', 'sqlmap_scan.sim', 'gobuster_scan.sim'],
    parameters: {
      nuclei_scan: { severity: ['critical', 'high'], templates: ['cves'] },
      sqlmap_scan: { threads: 3 },
      gobuster_scan: { wordlist: 'common.txt', threads: 20 }
    },
    tags: ['continuous', 'high-priority'],
    schedule: {
      type: 'continuous',
      timezone: 'UTC'
    },
    guardrails: {
      approvalsRequired: false,
      approvalsNeeded: 0,
      safeMode: true,
      maxParallelTasks: 2,
      notifyRoles: ['admin', 'auditor']
    },
    owner: 'pentester',
    createdAt: timestamp(),
    updatedAt: timestamp()
  }
];

const validateControlSurface = (payload: ControlSurface): ControlSurface =>
  ControlSurfaceSchema.parse(payload);

export class ControlCenter {
  private state: ControlSurface;

  constructor(initial?: Partial<ControlSurface>) {
    const composed: ControlSurface = {
      features: initial?.features ?? DEFAULT_FEATURES,
      roles: initial?.roles ?? DEFAULT_ROLES,
      scanProfiles: initial?.scanProfiles ?? DEFAULT_SCAN_PROFILES
    };
    this.state = validateControlSurface(composed);
  }

  public snapshot(): ControlSurface {
    return this.state;
  }

  public updateFeatures(updates: Array<FeatureToggle | FeatureTogglePatch>): ControlSurface {
    const next = [...this.state.features];
    for (const update of updates) {
      const existingIndex = next.findIndex((feature) => feature.id === update.id);
      if (existingIndex === -1) {
        const validated = FeatureToggleSchema.parse(update);
        next.push(validated);
        continue;
      }

      const merged = {
        ...next[existingIndex],
        ...update
      };
      next[existingIndex] = FeatureToggleSchema.parse(merged);
    }

    this.state = validateControlSurface({
      ...this.state,
      features: next
    });

    return this.state;
  }

  public updateRoles(updates: Array<RoleControl | RoleControlPatch>): ControlSurface {
    const next = [...this.state.roles];
    for (const update of updates) {
      const existingIndex = next.findIndex((role) => role.role === update.role);
      if (existingIndex === -1) {
        const validated = RoleControlSchema.parse(update);
        next.push(validated);
        continue;
      }

      const merged = {
        ...next[existingIndex],
        ...update,
        enforcement: {
          ...next[existingIndex].enforcement,
          ...(update as RoleControlPatch).enforcement
        }
      };
      next[existingIndex] = RoleControlSchema.parse(merged);
    }

    this.state = validateControlSurface({
      ...this.state,
      roles: next
    });

    return this.state;
  }

  public updateScanProfiles(updates: Array<ScanProfile | ScanProfilePatch>): ControlSurface {
    const next = [...this.state.scanProfiles];
    for (const update of updates) {
      const existingIndex = next.findIndex((profile) => profile.id === update.id);
      if (existingIndex === -1) {
        const validated = ScanProfileSchema.parse(update);
        next.push(validated);
        continue;
      }

      const merged = {
        ...next[existingIndex],
        ...update,
        schedule: {
          ...next[existingIndex].schedule,
          ...(update as ScanProfilePatch).schedule
        },
        guardrails: {
          ...next[existingIndex].guardrails,
          ...(update as ScanProfilePatch).guardrails
        },
        updatedAt: timestamp()
      };
      next[existingIndex] = ScanProfileSchema.parse(merged);
    }

    this.state = validateControlSurface({
      ...this.state,
      scanProfiles: next
    });

    return this.state;
  }

  public reset(): ControlSurface {
    this.state = validateControlSurface({
      features: DEFAULT_FEATURES,
      roles: DEFAULT_ROLES,
      scanProfiles: DEFAULT_SCAN_PROFILES
    });
    return this.state;
  }
}

export const controlCenter = new ControlCenter();
