/**
 * MailBridge Bootstrap - Security & Protection
 * Configures Helmet-style response headers, canonical 301 redirects, and rate limiting.
 */

import { createRateLimiter } from "../middleware/rateLimiter.js";

/**
 * Helmet-equivalent security headers middleware
 */
export function initSecurityHeaders(app) {
  // Prevent Express server identification
  app.disable("x-powered-by");

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    next();
  });
}

/**
 * Canonical 301 redirects: enforce HTTPS, apex domain, and trim trailing slashes
 */
export function initCanonicalRedirects(app) {
  app.use((req, res, next) => {
    const host = req.get("host") || "";
    const forwardedProto = req.headers["x-forwarded-proto"];

    // 1. Force HTTPS redirect if requested via plain HTTP in production
    if (
      forwardedProto === "http" ||
      (!req.secure &&
        process.env.NODE_ENV === "production" &&
        !host.includes("localhost") &&
        !host.includes("127.0.0.1"))
    ) {
      const cleanHost = host.replace(/^www\./, "");
      return res.redirect(301, `https://${cleanHost}${req.originalUrl || req.url}`);
    }

    // 2. Consolidate www to apex domain
    if (host.startsWith("www.mail-bridge.email")) {
      return res.redirect(301, `https://mail-bridge.email${req.originalUrl || req.url}`);
    }

    // 3. Remove trailing slash on non-root routes to prevent duplicate content
    if (req.path.length > 1 && req.path.endsWith("/") && !req.path.startsWith("/api/")) {
      const query = req.url.slice(req.path.length);
      const cleanPath = req.path.slice(0, -1);
      return res.redirect(301, `${cleanPath}${query}`);
    }

    next();
  });
}

/**
 * Global API rate limiter setup
 */
export function initRateLimiters(app) {
  const globalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: "Too many requests to the API, please try again later."
  });

  app.use("/api/v1", globalLimiter);
}

export default {
  initSecurityHeaders,
  initCanonicalRedirects,
  initRateLimiters
};
