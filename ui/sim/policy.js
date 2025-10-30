const PERMISSIONS = {
  "tool:*": ["execute_tools", "view_reports"],
  "dashboard:*": ["view_dashboards"]
};

export function expandPermissions(permissions) {
  const expanded = new Set();
  for (const perm of permissions) {
    if (PERMISSIONS[perm]) {
      for (const child of PERMISSIONS[perm]) {
        expanded.add(child);
      }
    } else {
      expanded.add(perm);
    }
  }
  return [...expanded];
}
