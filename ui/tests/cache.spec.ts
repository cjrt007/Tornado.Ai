import { describe, expect, it, vi } from 'vitest';
import { LruTtlCache } from '../sim/cache.js';

describe('smart cache (SCM mirror)', () => {
  it('evicts oldest entries when over capacity', () => {
    const cache = new LruTtlCache(1000, 2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    expect(cache.map.has('a')).toBe(false);
    expect(cache.evictions).toBe(1);
  });

  it('tracks hits and misses with TTL', async () => {
    const cache = new LruTtlCache(10, 2);
    cache.set('x', 42);
    expect(cache.get('x')).toBe(42);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(cache.get('x')).toBeUndefined();
    expect(cache.hits).toBe(1);
    expect(cache.misses).toBe(1);
  });
});
