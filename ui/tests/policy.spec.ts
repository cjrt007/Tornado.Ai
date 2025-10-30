import { describe, expect, it } from 'vitest';
import { expandPermissions } from '../sim/policy.js';

describe('policy expansion', () => {
  it('expands wildcard permissions', () => {
    const expanded = expandPermissions(['tool:*', 'configure_system']);
    expect(expanded).toContain('execute_tools');
    expect(expanded).toContain('view_reports');
    expect(expanded).toContain('configure_system');
  });
});
