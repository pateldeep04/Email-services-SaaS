import mongoose from "mongoose";
import ApiKey from "../models/ApiKey.js";
import { memoryStore } from "../services/memoryStore.js";
import { cacheService } from "../services/cacheService.js";

export async function requireApiKey(req, res, next) {
  const expectedKey = process.env.MAILBRIDGE_API_KEY;
  const providedKey = req.header("x-api-key");

  if (!providedKey) {
    return res.status(401).json({ error: "Missing API key", hint: "Send your key using x-api-key." });
  }

  // Only check hardcoded key if it's configured
  if (expectedKey && providedKey === expectedKey) {
    req.apiKeyUsed = providedKey;
    return next();
  }

  const cacheKey = `auth:apikey:${providedKey}`;
  const cachedAuth = cacheService.get(cacheKey);

  if (cachedAuth) {
    if (cachedAuth.notFound) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    if (cachedAuth.isRevoked) {
      return res.status(403).json({ error: "This API key has been revoked or deactivated by an administrator." });
    }
    req.apiClient = cachedAuth.client;
    req.apiKeyDoc = cachedAuth.keyDoc;
    req.apiKeyUsed = providedKey;
    return next();
  }

  const hasMongo = mongoose.connection.readyState === 1;
  let client = null;
  let keyDoc = null;

  if (hasMongo) {
    // Authenticate against ApiKey collection
    keyDoc = await ApiKey.findOne({ key: providedKey }).populate("userId");
    if (keyDoc) {
      if (keyDoc.isActive === false) {
        cacheService.set(cacheKey, { isRevoked: true }, 60);
        return res.status(403).json({ error: "This API key has been revoked or deactivated by an administrator." });
      }
      client = keyDoc.userId;
      keyDoc.lastUsedAt = new Date();
      keyDoc.save().catch(() => {}); // update in background
    }
  } else {
    // Memory store authentication
    keyDoc = memoryStore.findApiKey(providedKey);
    if (keyDoc) {
      if (keyDoc.isActive === false) {
        cacheService.set(cacheKey, { isRevoked: true }, 60);
        return res.status(403).json({ error: "This API key has been revoked or deactivated by an administrator." });
      }
      keyDoc.lastUsedAt = new Date().toISOString();
      client = await memoryStore.findUserById(keyDoc.userId);
    } else {
      client = await memoryStore.findUserByApiKey(providedKey);
    }
  }

  if (!client) {
    cacheService.set(cacheKey, { notFound: true }, 30);
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Cache valid active key for 5 minutes (300 seconds)
  cacheService.set(cacheKey, { client, keyDoc, isRevoked: false }, 300);

  req.apiClient = client;
  req.apiKeyDoc = keyDoc;
  req.apiKeyUsed = providedKey;
  next();
}
