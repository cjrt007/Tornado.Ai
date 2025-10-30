import { listToolDefinitions } from './registry/index.js';

const descriptors = listToolDefinitions().map((tool) => ({
  id: tool.id,
  summary: tool.summary,
  category: tool.category,
  requiredPermissions: tool.requiredPermissions,
  estimatedDuration: tool.estimatedDuration
}));

process.stdout.write(JSON.stringify(descriptors, null, 2));
