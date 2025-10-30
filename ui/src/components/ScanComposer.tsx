import { useMemo } from 'react';

import type { ScanProfile } from '../types/control';
import { useControlStore } from '../state/controlStore';

interface ScanComposerProps {
  scans: ScanProfile[];
}

const scheduleLabels: Record<ScanProfile['schedule']['type'], string> = {
  manual: 'Manual Launch',
  scheduled: 'Scheduled (CRON)',
  continuous: 'Continuous Monitoring'
};

export const ScanComposer = ({ scans }: ScanComposerProps) => {
  const persistScan = useControlStore((state) => state.persistScan);

  const sortedScans = useMemo(
    () =>
      [...scans].sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })),
    [scans]
  );

  const safeParseInt = (value: string, fallback: number) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const handleGuardrailChange = (scan: ScanProfile, key: keyof ScanProfile['guardrails'], value: unknown) => {
    persistScan({
      ...scan,
      guardrails: {
        ...scan.guardrails,
        [key]: value
      }
    });
  };

  const handleScheduleChange = (scan: ScanProfile, key: keyof ScanProfile['schedule'], value: unknown) => {
    persistScan({
      ...scan,
      schedule: {
        ...scan.schedule,
        [key]: value
      }
    });
  };

  const handleTargetsChange = (scan: ScanProfile, value: string) => {
    const targets = value.split('\n').map((line) => line.trim()).filter(Boolean);
    persistScan({ ...scan, targets });
  };

  const handleToolingChange = (scan: ScanProfile, value: string) => {
    const tooling = value.split(',').map((item) => item.trim()).filter(Boolean);
    persistScan({ ...scan, tooling });
  };

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      {sortedScans.map((scan) => (
        <article key={scan.id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg">
          <header className="border-b border-slate-800 px-6 py-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{scan.name}</h3>
                <p className="text-sm text-slate-300">{scan.description}</p>
              </div>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
                {scan.category}
              </span>
            </div>
          </header>
          <div className="grid gap-5 p-6">
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Targets</h4>
              <textarea
                value={scan.targets.join('\n')}
                onChange={(event) => handleTargetsChange(scan, event.target.value)}
                className="mt-2 h-24 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">One target per line. Supports CIDR ranges, hostnames, and URLs.</p>
            </section>
            <section>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Tool Stack</h4>
              <input
                type="text"
                value={scan.tooling.join(', ')}
                onChange={(event) => handleToolingChange(scan, event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Comma-separated tool identifiers. Align with MCP registry IDs.</p>
            </section>
            <section className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold uppercase tracking-wide text-slate-400">Schedule</label>
                <select
                  value={scan.schedule.type}
                  onChange={(event) => handleScheduleChange(scan, 'type', event.target.value as ScanProfile['schedule']['type'])}
                  className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 focus:border-primary focus:outline-none"
                >
                  {Object.entries(scheduleLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-slate-900">
                      {label}
                    </option>
                  ))}
                </select>
                {scan.schedule.type === 'scheduled' && (
                  <div className="mt-3 space-y-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">CRON Expression</label>
                    <input
                      type="text"
                      value={scan.schedule.cron ?? ''}
                      onChange={(event) => handleScheduleChange(scan, 'cron', event.target.value)}
                      placeholder="0 2 * * 1"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
                {scan.schedule.maintenanceWindow && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                      Window Start
                      <input
                        type="text"
                        value={scan.schedule.maintenanceWindow.start}
                        onChange={(event) =>
                          handleScheduleChange(scan, 'maintenanceWindow', {
                            ...scan.schedule.maintenanceWindow!,
                            start: event.target.value
                          })
                        }
                        className="mt-1 rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-slate-200 focus:border-primary focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                      Duration (min)
                      <input
                        type="number"
                        min={15}
                        value={scan.schedule.maintenanceWindow.durationMinutes}
                      onChange={(event) => {
                        const duration = safeParseInt(event.target.value, scan.schedule.maintenanceWindow!.durationMinutes);
                        handleScheduleChange(scan, 'maintenanceWindow', {
                          ...scan.schedule.maintenanceWindow!,
                          durationMinutes: duration
                        });
                      }}
                        className="mt-1 rounded-lg border border-slate-800 bg-slate-950 p-2 text-sm text-slate-200 focus:border-primary focus:outline-none"
                      />
                    </label>
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Timezone</label>
                  <input
                    type="text"
                    value={scan.schedule.timezone}
                    onChange={(event) => handleScheduleChange(scan, 'timezone', event.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold uppercase tracking-wide text-slate-400">Guardrails</label>
                <div className="mt-2 grid gap-3">
                  <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200">
                    Approvals Required
                    <input
                      type="checkbox"
                      checked={scan.guardrails.approvalsRequired}
                      onChange={(event) => handleGuardrailChange(scan, 'approvalsRequired', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200">
                    Safe Mode
                    <input
                      type="checkbox"
                      checked={scan.guardrails.safeMode}
                      onChange={(event) => handleGuardrailChange(scan, 'safeMode', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                    />
                  </label>
                  <div className="grid gap-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">Parallel Tasks</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={scan.guardrails.maxParallelTasks}
                      onChange={(event) =>
                        handleGuardrailChange(
                          scan,
                          'maxParallelTasks',
                          safeParseInt(event.target.value, scan.guardrails.maxParallelTasks)
                        )
                      }
                      className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">Approvals Needed</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={scan.guardrails.approvalsNeeded}
                      onChange={(event) =>
                        handleGuardrailChange(
                          scan,
                          'approvalsNeeded',
                          safeParseInt(event.target.value, scan.guardrails.approvalsNeeded)
                        )
                      }
                      className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">Notify Roles</label>
                    <input
                      type="text"
                      value={scan.guardrails.notifyRoles.join(', ')}
                      onChange={(event) =>
                        handleGuardrailChange(
                          scan,
                          'notifyRoles',
                          event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                        )
                      }
                      placeholder="admin, pentester"
                      className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>
            <footer className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Owner: {scan.owner}</span>
              <span>Updated: {new Date(scan.updatedAt).toLocaleString()}</span>
            </footer>
          </div>
        </article>
      ))}
    </section>
  );
};
