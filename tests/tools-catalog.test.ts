import { describe, expect, it } from 'vitest';

import { SecurityToolsCollectionSchema } from '../src/shared/types.js';
import { securityToolsCollection } from '../src/tools/catalog.js';

describe('securityToolsCollection dataset', () => {
  it('matches the declared schema', () => {
    expect(() => SecurityToolsCollectionSchema.parse(securityToolsCollection)).not.toThrow();
  });

  it('tracks the expected number of categories', () => {
    expect(securityToolsCollection.categories).toHaveLength(
      securityToolsCollection.statistics.total_categories
    );
  });

  it('does not exceed reported tool counts', () => {
    const totalListedTools = securityToolsCollection.categories.reduce(
      (sum, category) => sum + category.tools.length,
      0
    );

    for (const category of securityToolsCollection.categories) {
      expect(category.tools.length).toBeLessThanOrEqual(category.tool_count);
    }

    expect(totalListedTools).toBeLessThanOrEqual(securityToolsCollection.statistics.total_tools);
  });
});
