/**
 * MailBridge Bootstrap - CORS Configuration
 * Manages allowed cross-origin domains, local emulators, tunnels, and credentials.
 */

import cors from "cors";

/**
 * Validates whether an incoming HTTP origin header is permissible
 * @param {string} origin
 * @returns {boolean}
 */
export function isAllowedCorsOrigin(origin) {
  if (!origin || origin === "null") {
    return true;
  }

  const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://mail-bridge.email",
    "https://www.mail-bridge.email"
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);

    return (
      protocol === "file:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "mail-bridge.email" ||
      hostname.endsWith(".mail-bridge.email") ||
      hostname.endsWith(".onrender.com") ||
      hostname.endsWith(".loca.lt") ||
      hostname.endsWith(".devtunnels.ms") ||
      hostname.endsWith(".trycloudflare.com")
    );
  } catch {
    return false;
  }
}

/**
 * Initializes and returns the CORS Express middleware
 */
export function initCors() {
  return cors({
    credentials: true,
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  });
}

export default initCors;
