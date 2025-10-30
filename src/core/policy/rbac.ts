export type Permission = 'execute_tools' | 'view_reports' | 'manage_users' | 'configure_system';
type PermissionOrWildcard = Permission | '*';
type RolePermissions = readonly PermissionOrWildcard[];

const ALL_PERMISSIONS: Permission[] = [
  'execute_tools',
  'view_reports',
  'manage_users',
  'configure_system'
];

const rolePermissions = {
  admin: ['*'],
  pentester: ['execute_tools', 'view_reports'],
  auditor: ['view_reports'],
  viewer: ['view_reports']
} as const satisfies Record<string, RolePermissions>;

export type Role = keyof typeof rolePermissions;
type RolePermission = (typeof rolePermissions)[Role];

const hasWildcard = (perms: RolePermission): perms is readonly ['*'] => {
  return perms.length === 1 && perms[0] === '*';
};

const expandPermissions = (role: Role): Permission[] => {
  const perms = rolePermissions[role];
  if (hasWildcard(perms)) {
    return [...ALL_PERMISSIONS];
  }

  return [...perms];
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return expandPermissions(role).includes(permission);
};

export const listPermissions = (role: Role): Permission[] => expandPermissions(role);
