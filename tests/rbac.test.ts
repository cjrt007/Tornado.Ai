import { describe, expect, it } from 'vitest';

import { hasPermission, listPermissions } from '../src/core/policy/rbac.js';

describe('RBAC policies', () => {
  it('grants admin all permissions', () => {
    expect(listPermissions('admin')).toContain('manage_users');
    expect(hasPermission('admin', 'configure_system')).toBe(true);
  });

  it('restricts viewer role', () => {
    expect(listPermissions('viewer')).toEqual(['view_reports']);
    expect(hasPermission('viewer', 'execute_tools')).toBe(false);
  });
});
