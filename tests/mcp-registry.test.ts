import { describe, expect, it } from 'vitest';

import { listToolDefinitions } from '../src/mcp/registry/index.js';

describe('tool registry', () => {
  it('contains tool definitions for each category', () => {
    const tools = listToolDefinitions();
    const categories = new Set(tools.map((tool) => tool.category));
    expect(categories).toEqual(new Set(['network', 'webapp', 'cloud', 'binary', 'ctf', 'osint']));
    expect(tools.length).toBeGreaterThan(0);
  });
});
