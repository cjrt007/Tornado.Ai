import { describe, expect, it } from 'vitest';

import { ContentAddressedCache } from '../src/core/cache/index.js';

describe('ContentAddressedCache', () => {
  it('stores and retrieves values within ttl', () => {
    const cache = new ContentAddressedCache<string>(60);
    const key = ContentAddressedCache.keyFor('tool', { a: 1 });
    cache.set(key, 'value', 60);
    expect(cache.get(key)).toBe('value');
  });
});
