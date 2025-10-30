import type { ControlSurface, FeatureToggle, RoleControl, ScanProfile } from '../types/control';

const BASE_URL = '/api/control';

const jsonHeaders = {
  'Content-Type': 'application/json'
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return response.json() as Promise<T>;
};

export const fetchControlSurface = (): Promise<ControlSurface> =>
  fetch(BASE_URL, {
    method: 'GET'
  }).then((response) => handleResponse<ControlSurface>(response));

export const updateFeatures = (features: FeatureToggle[]): Promise<FeatureToggle[]> =>
  fetch(`${BASE_URL}/features`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ features })
  }).then((response) => handleResponse<FeatureToggle[]>(response));

export const updateRoles = (roles: RoleControl[]): Promise<RoleControl[]> =>
  fetch(`${BASE_URL}/roles`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ roles })
  }).then((response) => handleResponse<RoleControl[]>(response));

export const updateScanProfiles = (scanProfiles: ScanProfile[]): Promise<ScanProfile[]> =>
  fetch(`${BASE_URL}/scans`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ scanProfiles })
  }).then((response) => handleResponse<ScanProfile[]>(response));
