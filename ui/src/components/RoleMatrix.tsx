import { Switch } from '@headlessui/react';
import clsx from 'clsx';

import type { FeatureToggle, RoleControl } from '../types/control';
import { useControlStore } from '../state/controlStore';

interface RoleMatrixProps {
  roles: RoleControl[];
  features: FeatureToggle[];
}

const PERMISSION_PRESETS = [
  { id: 'execute_tools', label: 'Execute Tools' },
  { id: 'manage_scans', label: 'Manage Scans' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'view_dashboards', label: 'View Dashboards' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'configure_system', label: 'Configure System' }
];

export const RoleMatrix = ({ roles, features }: RoleMatrixProps) => {
  const persistRole = useControlStore((state) => state.persistRole);

  const toggleFeature = (role: RoleControl, featureId: string) => {
    const featureAccess = role.featureAccess.includes(featureId)
      ? role.featureAccess.filter((id) => id !== featureId)
      : [...role.featureAccess, featureId];
    persistRole({ ...role, featureAccess });
  };

  const togglePermission = (role: RoleControl, permissionId: string) => {
    const permissions = role.permissions.includes('*')
      ? role.permissions
      : role.permissions.includes(permissionId)
        ? role.permissions.filter((id) => id !== permissionId)
        : [...role.permissions, permissionId];
    persistRole({ ...role, permissions });
  };

  const updateSessionTimeout = (role: RoleControl, value: number) => {
    persistRole({
      ...role,
      enforcement: {
        ...role.enforcement,
        sessionTimeoutMinutes: value
      }
    });
  };

  const toggleMfa = (role: RoleControl, value: boolean) => {
    persistRole({
      ...role,
      enforcement: {
        ...role.enforcement,
        mfaRequired: value
      }
    });
  };

  return (
    <section className="space-y-6">
      {roles.map((role) => (
        <article key={role.role} className="rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg">
          <header className="flex flex-col gap-2 border-b border-slate-800 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{role.displayName}</h3>
              <p className="text-sm text-slate-300">{role.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <span>MFA Required</span>
                <Switch
                  checked={role.enforcement.mfaRequired}
                  onChange={(value) => toggleMfa(role, value)}
                  className={clsx(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    role.enforcement.mfaRequired ? 'bg-primary' : 'bg-slate-700'
                  )}
                >
                  <span className="sr-only">Toggle MFA for {role.displayName}</span>
                  <span
                    aria-hidden="true"
                    className={clsx(
                      role.enforcement.mfaRequired ? 'translate-x-5' : 'translate-x-0',
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <span>Session (min)</span>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={role.enforcement.sessionTimeoutMinutes}
                  onChange={(event) => updateSessionTimeout(role, Number.parseInt(event.target.value, 10))}
                  className="w-20 rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-right text-sm text-slate-100 focus:border-primary focus:outline-none"
                />
              </label>
            </div>
          </header>
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Feature Access</h4>
              <div className="mt-3 grid gap-2">
                {features.map((feature) => (
                  <label key={feature.id} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                    <input
                      type="checkbox"
                      checked={role.featureAccess.includes(feature.id)}
                      onChange={() => toggleFeature(role, feature.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{feature.label}</p>
                      <p className="text-xs text-slate-400">{feature.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Permissions</h4>
              <div className="mt-3 grid gap-2">
                {role.permissions.includes('*') ? (
                  <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    Full access granted via wildcard.
                  </p>
                ) : (
                  PERMISSION_PRESETS.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                    >
                      <span className="text-sm text-slate-200">{permission.label}</span>
                      <input
                        type="checkbox"
                        checked={role.permissions.includes(permission.id)}
                        onChange={() => togglePermission(role, permission.id)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                      />
                    </label>
                  ))
                )}
              </div>
            </section>
          </div>
        </article>
      ))}
    </section>
  );
};
