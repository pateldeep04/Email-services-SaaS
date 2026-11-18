/**
 * MailBridge Bootstrap - Database & Persistence Initialization
 * Connects to MongoDB Atlas with auto-retry, public DNS fallback, and in-memory safety.
 */

import mongoose from "mongoose";
import dns from "dns";
import { logger } from "./logger.js";

let isConnecting = false;

/**
 * Initialize MongoDB connection with Atlas DNS fallback
 */
export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.warn("No MongoDB URI configured. Using safe in-memory store.");
    isConnecting = false;
    return null;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    logger.banner("✅ MongoDB Atlas (Cloud) Connected Successfully!", {
      "📦 Database": mongoose.connection.name,
      "🌐 Cluster Host": mongoose.connection.host
    });
    isConnecting = false;
    return mongoose.connection;
  } catch (error) {
    let connected = false;

    // Retry with public DNS fallback if DNS SRV resolution failed
    if (
      error.message.includes("querySrv") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ECONNREFUSED")
    ) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        logger.banner("✅ MongoDB Atlas (Cloud) Connected Successfully! (via public DNS fallback)", {
          "📦 Database": mongoose.connection.name,
          "🌐 Cluster Host": mongoose.connection.host
        });
        connected = true;
      } catch (_retryError) {
        // DNS fallback failed
      }
    }

    if (!connected) {
      await mongoose.disconnect().catch(() => {});
      logger.warn(`MongoDB unavailable (${error.message}). Using safe in-memory store.`);
    }

    isConnecting = false;
    return connected ? mongoose.connection : null;
  }
}

/**
 * Gracefully disconnect database during process termination
 */
export async function disconnectDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed gracefully.");
    }
  } catch (err) {
    logger.error("Error closing MongoDB connection:", err.message);
  }
}

/**
 * Check active database status
 */
export function getDatabaseStatus() {
  const readyStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const state = readyStates[mongoose.connection.readyState] || "unknown";
  return {
    connected: mongoose.connection.readyState === 1,
    type: mongoose.connection.readyState === 1 ? "mongodb" : "memory",
    state,
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null
  };
}

export default {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus
};
