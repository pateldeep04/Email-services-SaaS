/**
 * MailBridge Bootstrap - Central Startup Orchestrator
 * Coordinates database connection, security, CORS, session, logger, telemetry, and static assets.
 */

import express from "express";
import { initCors } from "./cors.js";
import { initSecurityHeaders, initCanonicalRedirects, initRateLimiters } from "./security.js";
import { initSession } from "./session.js";
import { requestLogger, logger } from "./logger.js";
import { initTelemetry } from "./telemetry.js";
import { initStaticAssets } from "./static.js";
import { connectDatabase, disconnectDatabase } from "./database.js";
import { initializeAdminUser } from "../services/adminService.js";

/**
 * Configure baseline middleware, security, and telemetry on the Express app
 */
export function bootstrapApp(app) {
  // Trust reverse proxies (Nginx, Render, Cloudflare, etc.)
  app.set("trust proxy", 1);

  // 1. Security Headers & Canonical 301 Redirects
  initSecurityHeaders(app);
  initCanonicalRedirects(app);

  // 2. CORS Policy
  app.use(initCors());

  // 3. Request Telemetry & Structured Logging
  app.use(requestLogger);

  // 4. Session & Body Parsing
  app.use(initSession());
  app.use(express.json({ limit: "1mb" }));

  // 5. Global API Rate Limiting
  initRateLimiters(app);

  // 6. System Health & Telemetry Endpoint (/api/health)
  initTelemetry(app);

  return app;
}

/**
 * Finalize frontend assets and global error handling
 */
export function finalizeApp(app) {
  // Static frontend build delivery & SEO meta injection
  initStaticAssets(app);

  // Global Error Handler
  app.use((err, _req, res, _next) => {
    const statusCode = Number(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    
    if (statusCode >= 500) {
      logger.error("Internal Server Error:", err.message);
    }

    let safeMessage = err.message || "An unexpected error occurred.";
    if (statusCode === 500) {
      if (process.env.NODE_ENV === "production") {
        safeMessage = "An internal server error occurred. Please try again later.";
      } else if (
        safeMessage.toLowerCase().includes("bad auth") ||
        safeMessage.toLowerCase().includes("authentication failed")
      ) {
        safeMessage = "Database connectivity issue encountered.";
      }
    }

    res.status(statusCode).json({ error: safeMessage });
  });

  return app;
}

/**
 * Initialize asynchronous background services (database, default admin, etc.)
 */
export async function bootstrapServices() {
  await connectDatabase();
  await initializeAdminUser();
}

/**
 * Setup graceful process shutdown handlers for SIGTERM and SIGINT
 */
export function setupGracefulShutdown(server) {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    if (server && server.close) {
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 5000);
    } else {
      await disconnectDatabase();
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export default {
  bootstrapApp,
  finalizeApp,
  bootstrapServices,
  setupGracefulShutdown
};
