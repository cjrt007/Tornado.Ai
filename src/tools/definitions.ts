import { z } from 'zod';

import { ToolSpecSchema } from '../shared/types.js';

const baseTool = ToolSpecSchema.pick({
  id: true,
  category: true,
  summary: true,
  requiredPermissions: true,
  estimatedDuration: true
}).extend({
  inputSchema: z.any(),
  outputSchema: z.any().optional()
});

export type ToolDefinition = z.infer<typeof baseTool>;

const createSpec = (spec: ToolDefinition): ToolDefinition => baseTool.parse(spec);

export const toolDefinitions: ToolDefinition[] = [
  createSpec({
    id: 'nmap_scan.sim',
    category: 'network',
    summary: 'Simulated Nmap scan that enumerates open ports on targets.',
    inputSchema: {
      targets: 'string[]',
      intensity: 'low|med|high',
      ports: 'string?',
      scripts: 'string[]?'
    },
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 120
  }),
  createSpec({
    id: 'masscan_scan.sim',
    category: 'network',
    summary: 'High-speed TCP port scanner.',
    inputSchema: {
      targets: 'string[]',
      ports: 'string',
      rate: 'number'
    },
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 90
  }),
  createSpec({
    id: 'rustscan_scan.sim',
    category: 'network',
    summary: 'Hybrid port scanner combining Nmap and RustScan.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 75
  }),
  createSpec({
    id: 'amass_enum.sim',
    category: 'network',
    summary: 'Enumerate subdomains using OWASP Amass.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 180
  }),
  createSpec({
    id: 'autorecon_scan.sim',
    category: 'network',
    summary: 'Automated network reconnaissance workflow.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 240
  }),
  createSpec({
    id: 'gobuster_scan.sim',
    category: 'webapp',
    summary: 'Directory brute-forcing for web applications.',
    inputSchema: {
      url: 'string',
      wordlist: 'string',
      extensions: 'string[]?',
      threads: 'number?'
    },
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 60
  }),
  createSpec({
    id: 'ffuf_scan.sim',
    category: 'webapp',
    summary: 'Content discovery using FFUF.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 50
  }),
  createSpec({
    id: 'nuclei_scan.sim',
    category: 'webapp',
    summary: 'Template-based vulnerability scanning.',
    inputSchema: {
      targets: 'string[]',
      templates: 'string[]?',
      severity: 'string[]?'
    },
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 180
  }),
  createSpec({
    id: 'sqlmap_scan.sim',
    category: 'webapp',
    summary: 'SQL injection testing workflow.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 200
  }),
  createSpec({
    id: 'wpscan_scan.sim',
    category: 'webapp',
    summary: 'WordPress security assessment.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 120
  }),
  createSpec({
    id: 'prowler_assess.sim',
    category: 'cloud',
    summary: 'AWS security best-practice assessment.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 300
  }),
  createSpec({
    id: 'scout_suite_audit.sim',
    category: 'cloud',
    summary: 'Multi-cloud security auditing.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 320
  }),
  createSpec({
    id: 'trivy_scan.sim',
    category: 'cloud',
    summary: 'Container and artifact vulnerability scanning.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 110
  }),
  createSpec({
    id: 'kube_hunter_scan.sim',
    category: 'cloud',
    summary: 'Kubernetes cluster penetration testing.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 260
  }),
  createSpec({
    id: 'kube_bench_check.sim',
    category: 'cloud',
    summary: 'Kubernetes CIS benchmark checks.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 220
  }),
  createSpec({
    id: 'ghidra_analyze.sim',
    category: 'binary',
    summary: 'Reverse engineering workflow using Ghidra.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 600
  }),
  createSpec({
    id: 'radare2_analyze.sim',
    category: 'binary',
    summary: 'Binary analysis using radare2.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 480
  }),
  createSpec({
    id: 'angr_analyze.sim',
    category: 'binary',
    summary: 'Symbolic execution with angr.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 540
  }),
  createSpec({
    id: 'volatility_analyze.sim',
    category: 'ctf',
    summary: 'Memory forensics with Volatility.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 360
  }),
  createSpec({
    id: 'binwalk_analyze.sim',
    category: 'ctf',
    summary: 'Firmware analysis using Binwalk.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 240
  }),
  createSpec({
    id: 'recon_ng.sim',
    category: 'osint',
    summary: 'Modular OSINT automation.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 200
  }),
  createSpec({
    id: 'spiderfoot.sim',
    category: 'osint',
    summary: 'Automated OSINT data collection.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 220
  }),
  createSpec({
    id: 'theharvester.sim',
    category: 'osint',
    summary: 'Harvest emails, hosts, and domains.',
    inputSchema: {},
    requiredPermissions: ['execute_tools'],
    estimatedDuration: 160
  })
];
