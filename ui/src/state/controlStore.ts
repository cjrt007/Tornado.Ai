import { create } from 'zustand';

import type { ControlSurface, FeatureToggle, RoleControl, ScanProfile } from '../types/control';
import { fetchControlSurface, updateFeatures, updateRoles, updateScanProfiles } from '../api/controlClient';

interface ControlState {
  surface?: ControlSurface;
  loading: boolean;
  error?: string;
  fetchSurface: () => Promise<void>;
  toggleFeature: (feature: FeatureToggle, enabled: boolean) => Promise<void>;
  persistRole: (role: RoleControl) => Promise<void>;
  persistScan: (scan: ScanProfile) => Promise<void>;
}

export const useControlStore = create<ControlState>((set, get) => ({
  surface: undefined,
  loading: false,
  error: undefined,
  async fetchSurface() {
    set({ loading: true, error: undefined });
    try {
      const surface = await fetchControlSurface();
      set({ surface, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  async toggleFeature(feature, enabled) {
    const current = get().surface;
    if (!current) return;

    const next: FeatureToggle = { ...feature, enabled };
    set({
      error: undefined,
      surface: { ...current, features: current.features.map((item) => (item.id === feature.id ? next : item)) }
    });

    try {
      const features = await updateFeatures([next]);
      set({
        error: undefined,
        surface: {
          ...get().surface!,
          features: get().surface!.features.map((item) =>
            item.id === feature.id ? features.find((entry) => entry.id === item.id) ?? next : item
          )
        }
      });
    } catch (error) {
      set({ error: (error as Error).message });
      set({ surface: current });
    }
  },
  async persistRole(role) {
    const current = get().surface;
    if (!current) return;
    const optimistic = {
      ...current,
      roles: current.roles.map((item) => (item.role === role.role ? role : item))
    };
    set({ surface: optimistic, error: undefined });

    try {
      const roles = await updateRoles([role]);
      set({
        error: undefined,
        surface: {
          ...get().surface!,
          roles: get().surface!.roles.map((item) =>
            item.role === role.role ? roles.find((entry) => entry.role === item.role) ?? role : item
          )
        }
      });
    } catch (error) {
      set({ error: (error as Error).message, surface: current });
    }
  },
  async persistScan(scan) {
    const current = get().surface;
    if (!current) return;

    const optimistic = {
      ...current,
      scanProfiles: current.scanProfiles.map((item) => (item.id === scan.id ? scan : item))
    };
    set({ surface: optimistic, error: undefined });

    try {
      const scans = await updateScanProfiles([scan]);
      set({
        error: undefined,
        surface: {
          ...get().surface!,
          scanProfiles: get().surface!.scanProfiles.map((item) =>
            item.id === scan.id ? scans.find((entry) => entry.id === item.id) ?? scan : item
          )
        }
      });
    } catch (error) {
      set({ error: (error as Error).message, surface: current });
    }
  }
}));
