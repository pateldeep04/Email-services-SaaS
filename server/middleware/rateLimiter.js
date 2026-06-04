/**
 * Simple, self-cleaning in-memory rate limiter middleware.
 * Uses client IP or custom key (e.g. API keys) to rate-limit requests.
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // Default: 15 minutes
  max = 100,                 // Default: 100 requests per window
  message = "Too many requests, please try again later.",
  statusCode = 429,
  keyGenerator = (req) => req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.connection?.remoteAddress || "global"
} = {}) {
  const hits = new Map();

  // Prunes expired records to prevent memory leak
  const prune = () => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  };

  return (req, res, next) => {
    // If the cache is getting large, prune expired entries to preserve memory
    if (hits.size > 5000) {
      prune();
    }

    const key = keyGenerator(req);
    const now = Date.now();

    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
      hits.set(key, record);
    }

    record.count++;

    // Set response headers
    const remaining = Math.max(0, max - record.count);
    const resetTimeSecs = Math.ceil(record.resetTime / 1000);

    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetTimeSecs);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTimeSecs);

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(statusCode).json({
        error: message,
        retryAfter
      });
    }

    next();
  };
}
