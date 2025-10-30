import { describe, expect, it } from 'vitest';

import { ControlCenter } from '../src/core/control/center.js';

describe('ControlCenter', () => {
  it('exposes default control surface', () => {
    const center = new ControlCenter();
    const snapshot = center.snapshot();

    expect(snapshot.features.length).toBeGreaterThan(0);
    expect(snapshot.roles.find((role) => role.role === 'admin')).toBeDefined();
    expect(snapshot.scanProfiles.length).toBeGreaterThan(0);
  });

  it('merges feature toggle updates', () => {
    const center = new ControlCenter();
    const snapshot = center.snapshot();
    const target = snapshot.features[0];

    center.updateFeatures([
      {
        id: target.id,
        enabled: !target.enabled
      }
    ]);

    const updated = center.snapshot();
    const updatedFeature = updated.features.find((feature) => feature.id === target.id);
    expect(updatedFeature?.enabled).toBe(!target.enabled);
  });

  it('applies role enforcement overrides', () => {
    const center = new ControlCenter();
    const target = center.snapshot().roles.find((role) => role.role === 'viewer');
    expect(target).toBeDefined();

    center.updateRoles([
      {
        role: 'viewer',
        enforcement: {
          mfaRequired: true,
          sessionTimeoutMinutes: 45
        }
      }
    ]);

    const updated = center.snapshot().roles.find((role) => role.role === 'viewer');
    expect(updated?.enforcement.mfaRequired).toBe(true);
    expect(updated?.enforcement.sessionTimeoutMinutes).toBe(45);
  });

  it('updates scan guardrails and schedule metadata', () => {
    const center = new ControlCenter();
    const target = center.snapshot().scanProfiles[0];
    expect(target).toBeDefined();

    const updatedSurface = center.updateScanProfiles([
      {
        id: target.id,
        guardrails: {
          approvalsRequired: false,
          approvalsNeeded: 0,
          safeMode: false,
          maxParallelTasks: 5
        }
      }
    ]);

    const updatedProfile = updatedSurface.scanProfiles.find((profile) => profile.id === target.id);
    expect(updatedProfile?.guardrails.safeMode).toBe(false);
    expect(updatedProfile?.guardrails.maxParallelTasks).toBe(5);
  });
});
