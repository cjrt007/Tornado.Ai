const ADAPTER_OUTPUTS = {
  "nmap_scan.sim": { summary: "Enumerated ports" },
  "nuclei_scan.sim": { summary: "Template vulnerabilities" },
  "prowler_assess.sim": { summary: "Cloud misconfigurations" }
};

export function adapterIds() {
  return Object.keys(ADAPTER_OUTPUTS);
}

export function runDry(toolId, params = {}) {
  if (!ADAPTER_OUTPUTS[toolId]) {
    throw new Error(`Unknown adapter ${toolId}`);
  }
  return {
    toolId,
    params,
    output: ADAPTER_OUTPUTS[toolId]
  };
}
