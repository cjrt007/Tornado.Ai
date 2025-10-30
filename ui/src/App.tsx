import { useEffect } from 'react';
import { CircleAlert, ShieldCheck, SlidersHorizontal } from 'lucide-react';

import { FeatureToggleGrid } from './components/FeatureToggleGrid';
import { RoleMatrix } from './components/RoleMatrix';
import { ScanComposer } from './components/ScanComposer';
import { useControlStore } from './state/controlStore';

const App = () => {
  const { surface, fetchSurface, loading, error } = useControlStore((state) => ({
    surface: state.surface,
    fetchSurface: state.fetchSurface,
    loading: state.loading,
    error: state.error
  }));

  useEffect(() => {
    void fetchSurface();
  }, [fetchSurface]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tornado.ai Control Center</h1>
            <p className="mt-2 max-w-3xl text-base text-slate-300">
              Coordinate feature exposure, enforce granular role policies, and orchestrate scan profiles with the same precision
              you expect from enterprise platforms like Nessus and Burp Suite.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2">
              <ShieldCheck size={16} /> RBAC Hardened
            </span>
            <span className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2">
              <SlidersHorizontal size={16} /> Full-spectrum Scan Control
            </span>
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300">
            Loading orchestration surface...
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-200">
            <CircleAlert size={18} /> {error}
          </div>
        )}

        {surface && !loading && (
          <div className="space-y-12">
            <section>
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Feature Controls</h2>
                <p className="text-sm text-slate-400">Enable and disable platform capabilities per domain.</p>
              </header>
              <FeatureToggleGrid features={surface.features} />
            </section>

            <section>
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Role Governance</h2>
                <p className="text-sm text-slate-400">Assign features, runtime permissions, and policy guardrails per persona.</p>
              </header>
              <RoleMatrix roles={surface.roles} features={surface.features} />
            </section>

            <section>
              <header className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Scan Orchestration</h2>
                <p className="text-sm text-slate-400">Curate Nessus-grade scanning blueprints with granular guardrails.</p>
              </header>
              <ScanComposer scans={surface.scanProfiles} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
