import crypto from 'node:crypto';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class ContentAddressedCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private readonly defaultTtlSeconds: number) {}

  static keyFor(toolId: string, params: unknown): string {
    const stable = JSON.stringify(params ?? {});
    return crypto.createHash('sha256').update(`${toolId}:${stable}`).digest('hex');
  }

  set(key: string, value: T, ttlSeconds = this.defaultTtlSeconds): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  stats() {
    return {
      size: this.store.size
    };
  }
}
