import mongoose from "mongoose";
import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js";
import { memoryStore } from "../services/memoryStore.js";

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

  const hasMongo = mongoose.connection.readyState === 1;
  let client = null;

  let keyDoc = null;

  if (hasMongo) {
    // Authenticate strictly against active keys in the ApiKey collection
    keyDoc = await ApiKey.findOne({ key: providedKey }).populate("userId");
    if (keyDoc) {
      client = keyDoc.userId;
      keyDoc.lastUsedAt = new Date();
      await keyDoc.save().catch(() => {}); // update in background
    }
  } else {
    // Memory store authentication
    keyDoc = memoryStore.findApiKey(providedKey);
    if (keyDoc) {
      keyDoc.lastUsedAt = new Date().toISOString();
      client = await memoryStore.findUserById(keyDoc.userId);
    } else {
      client = await memoryStore.findUserByApiKey(providedKey);
    }
  }

  if (!client) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.apiClient = client;
  req.apiKeyDoc = keyDoc;
  req.apiKeyUsed = providedKey;
  next();
}
