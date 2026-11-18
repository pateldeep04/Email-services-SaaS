/**
 * MailBridge Bootstrap - Telemetry & System Health
 * Exposes health checks, system diagnostic metrics, and uptime telemetry.
 */

import { getDatabaseStatus } from "./database.js";

const startTime = Date.now();

/**
 * Returns aggregated system health and telemetry metrics
 */
export function getSystemTelemetry() {
  const dbStatus = getDatabaseStatus();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  return {
    ok: true,
    service: "MailBridge Email API",
    version: "1.0.0",
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    database: dbStatus.type,
    databaseConnected: dbStatus.connected,
    smtpConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    memory: {
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024)
    }
  };
}

/**
 * Attaches the /api/health telemetry route
 */
export function initTelemetry(app) {
  app.get("/api/health", (_req, res) => {
    res.json(getSystemTelemetry());
  });
}

export default {
  getSystemTelemetry,
  initTelemetry
};
