export class LruTtlCache {
  constructor(ttlMs, capacity) {
    this.ttl = ttlMs;
    this.capacity = capacity;
    this.map = new Map();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  _now() {
    return Date.now();
  }

  _purgeExpired() {
    const now = this._now();
    for (const [key, entry] of [...this.map.entries()]) {
      if (entry.expiresAt <= now) {
        this.map.delete(key);
      }
    }
  }

  set(key, value) {
    this._purgeExpired();
    this.map.set(key, { value, expiresAt: this._now() + this.ttl });
    this._ensureCapacity();
  }

  get(key) {
    this._purgeExpired();
    const entry = this.map.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }
    this.map.delete(key);
    this.map.set(key, entry);
    this.hits += 1;
    return entry.value;
  }

  _ensureCapacity() {
    while (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
      this.evictions += 1;
    }
  }
}
