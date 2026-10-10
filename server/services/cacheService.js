/**
 * High-Performance In-Memory Caching Engine
 * Provides TTL-based expiration, LRU eviction, prefix invalidation, and metrics.
 */
class CacheService {
  constructor(options = {}) {
    this.maxItems = options.maxItems || 5000;
    this.defaultTtlSeconds = options.defaultTtlSeconds || 300; // 5 minutes
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      flushes: 0
    };

    // Auto cleanup sweep every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 60000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    // Refresh LRU order in Map
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlSeconds = this.defaultTtlSeconds) {
    if (this.cache.size >= this.maxItems) {
      // Evict oldest (first) item
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    this.stats.sets++;
    return value;
  }

  del(key) {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  delPrefix(prefix) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.deletes += count;
    return count;
  }

  flush() {
    this.cache.clear();
    this.stats.flushes++;
  }

  async wrap(key, ttlSeconds, fetchFn) {
    const cached = this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const fresh = await fetchFn();
    if (fresh !== null && fresh !== undefined) {
      this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? Math.round((this.stats.hits / totalRequests) * 100) : 0;
    return {
      keysCount: this.cache.size,
      maxItems: this.maxItems,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRatioPercent: hitRatio,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      flushes: this.stats.flushes
    };
  }
}

export const cacheService = new CacheService();
