import { useMemo } from 'react';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';

import type { FeatureToggle } from '../types/control';
import { useControlStore } from '../state/controlStore';

interface FeatureToggleGridProps {
  features: FeatureToggle[];
}

const categoryLabels: Record<FeatureToggle['category'], string> = {
  general: 'Platform',
  auth: 'Authentication',
  mcp: 'Model Context Protocol',
  reporting: 'Reporting',
  ui: 'User Interface',
  observability: 'Observability',
  tools: 'Tooling'
};

export const FeatureToggleGrid = ({ features }: FeatureToggleGridProps) => {
  const grouped = useMemo(() => {
    return features.reduce<Record<FeatureToggle['category'], FeatureToggle[]>>(
      (accumulator, feature) => {
        if (!accumulator[feature.category]) {
          accumulator[feature.category] = [] as FeatureToggle[];
        }
        accumulator[feature.category].push(feature);
        return accumulator;
      },
      {
        general: [],
        auth: [],
        mcp: [],
        reporting: [],
        ui: [],
        observability: [],
        tools: []
      }
    );
  }, [features]);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <FeatureCategorySection key={category} category={category as FeatureToggle['category']} items={items} />
      ))}
    </div>
  );
};

interface FeatureCategorySectionProps {
  category: FeatureToggle['category'];
  items: FeatureToggle[];
}

const FeatureCategorySection = ({ category, items }: FeatureCategorySectionProps) => {
  const toggleFeature = useControlStore((state) => state.toggleFeature);

  if (!items.length) return null;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{categoryLabels[category]}</h3>
          <p className="text-sm text-slate-400">Fine-tune feature access and runtime behaviors.</p>
        </div>
      </header>
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((feature) => (
          <article key={feature.id} className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white">{feature.label}</h4>
                <Switch
                  checked={feature.enabled}
                  onChange={(value) => toggleFeature(feature, value)}
                  disabled={feature.locked}
                  className={clsx(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    feature.locked && 'cursor-not-allowed opacity-60',
                    feature.enabled ? 'bg-primary' : 'bg-slate-700'
                  )}
                >
                  <span className="sr-only">Toggle {feature.label}</span>
                  <span
                    aria-hidden="true"
                    className={clsx(
                      feature.enabled ? 'translate-x-5' : 'translate-x-0',
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </div>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </div>
            <footer className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                {feature.category}
              </span>
              {feature.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                  #{tag}
                </span>
              ))}
              {feature.requiresRestart && (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                  restart required
                </span>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
};
