const rolePermissions = {
  admin: ['*'],
  pentester: ['execute_tools', 'view_reports'],
  auditor: ['view_reports'],
  viewer: ['view_reports']
} as const;

export type Role = keyof typeof rolePermissions;
export type Permission = 'execute_tools' | 'view_reports' | 'manage_users' | 'configure_system';

const expandPermissions = (role: Role): Permission[] => {
  const perms = rolePermissions[role];
  if (perms.includes('*')) {
    return ['execute_tools', 'view_reports', 'manage_users', 'configure_system'];
  }
  return perms as Permission[];
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return expandPermissions(role).includes(permission);
};

export const listPermissions = (role: Role): Permission[] => expandPermissions(role);
