export const categoryPriority = {
  webapp: ["webapp", "osint", "network"],
  api: ["webapp", "network", "osint"],
  mobile: ["webapp", "ctf", "osint"],
  cloud: ["cloud", "osint", "network"],
  infrastructure: ["network", "cloud", "osint"],
  binary: ["binary", "ctf", "network"],
  iot: ["network", "binary", "webapp"]
};

export function scoreTool(category, profileCvss, weight, bias) {
  const multiplier = 1 + profileCvss / 10;
  return Number((weight * multiplier + bias).toFixed(2));
}

export function selectTools(tools, profile, history = []) {
  const priorities = categoryPriority[profile.assetKind] ?? ["network"];
  const historyMap = new Map(history.map((item) => [item.toolId, item]));
  return tools
    .filter((tool) => priorities.includes(tool.category))
    .filter((tool) => {
      const prior = historyMap.get(tool.id);
      return !(prior && prior.success);
    })
    .map((tool) => ({
      toolId: tool.id,
      category: tool.category,
      score: scoreTool(tool.category, profile.cvss, tool.weight ?? 1, tool.bias ?? 0)
    }))
    .sort((a, b) => b.score - a.score);
}
