/**
 * MailBridge Bootstrap - Enterprise Logger & Diagnostics
 * Provides structured logging, colored CLI banners, and request telemetry middleware.
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLevel = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toLowerCase()] || LOG_LEVELS.info 
  : LOG_LEVELS.info;

function formatTimestamp() {
  return new Date().toISOString();
}

export const logger = {
  debug(...args) {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(`[${formatTimestamp()}] [DEBUG]`, ...args);
    }
  },
  info(...args) {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(`[${formatTimestamp()}] [INFO]`, ...args);
    }
  },
  warn(...args) {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(`[${formatTimestamp()}] [WARN]`, ...args);
    }
  },
  error(...args) {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(`[${formatTimestamp()}] [ERROR]`, ...args);
    }
  },
  banner(title, details = {}) {
    console.log("==========================================");
    console.log(title);
    Object.entries(details).forEach(([key, val]) => {
      console.log(`${key}: ${val}`);
    });
    console.log("==========================================");
  }
};

/**
 * Express middleware for incoming request telemetry & duration tracking
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Don't log health checks or static assets to keep terminal output clean
  if (originalUrl === "/api/health" || originalUrl.startsWith("/assets/")) {
    return next();
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    logger[level](`${method} ${originalUrl} -> ${status} (${duration}ms)`);
  });

  next();
}

export default logger;
