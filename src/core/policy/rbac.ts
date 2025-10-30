export type Permission = 'execute_tools' | 'view_reports' | 'manage_users' | 'configure_system';

type RolePermission = Permission | '*';

const rolePermissions = {
  admin: ['*'],
  pentester: ['execute_tools', 'view_reports'],
  auditor: ['view_reports'],
  viewer: ['view_reports']
} as const satisfies Record<string, readonly RolePermission[]>;

export type Role = keyof typeof rolePermissions;

const fullPermissionSet: Permission[] = [
  'execute_tools',
  'view_reports',
  'manage_users',
  'configure_system'
];

const expandPermissions = (role: Role): Permission[] => {
  const perms = rolePermissions[role];
  if (perms.includes('*')) {
    return [...fullPermissionSet];
  }
  return perms.filter((perm): perm is Permission => perm !== '*');
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return expandPermissions(role).includes(permission);
};

export const listPermissions = (role: Role): Permission[] => expandPermissions(role);
