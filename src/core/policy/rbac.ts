export type Permission = 'execute_tools' | 'view_reports' | 'manage_users' | 'configure_system';

const WILDCARD_PERMISSION = '*' as const;
type RolePermissions = Permission[] | typeof WILDCARD_PERMISSION;

const ALL_PERMISSIONS: Permission[] = [
  'execute_tools',
  'view_reports',
  'manage_users',
  'configure_system'
];

const rolePermissions: Record<string, RolePermissions> = {
  admin: WILDCARD_PERMISSION,
  pentester: ['execute_tools', 'view_reports'],
  auditor: ['view_reports'],
  viewer: ['view_reports']
};

export type Role = keyof typeof rolePermissions;

const expandPermissions = (role: Role): Permission[] => {
  const perms = rolePermissions[role];

  if (perms === WILDCARD_PERMISSION) {
    return [...ALL_PERMISSIONS];
  }

  return [...perms];
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return expandPermissions(role).includes(permission);
};

export const listPermissions = (role: Role): Permission[] => expandPermissions(role);
