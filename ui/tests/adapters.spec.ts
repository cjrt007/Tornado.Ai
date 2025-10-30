import { describe, expect, it } from 'vitest';
import { adapterIds, runDry } from '../sim/adapters.js';

describe('adapter registry', () => {
  it('exposes known adapter ids', () => {
    expect(adapterIds()).toContain('nmap_scan.sim');
  });

  it('returns deterministic dry-run output', () => {
    const result = runDry('nuclei_scan.sim', { targets: ['https://example.com'] });
    expect(result.output.summary).toMatch(/Template/);
  });

  it('throws for unknown adapters', () => {
    expect(() => runDry('unknown')).toThrow();
  });
});
