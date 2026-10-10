import express from "express";
import mongoose from "mongoose";
import WebhookEndpoint from "../models/WebhookEndpoint.js";
import WebhookDeliveryLog from "../models/WebhookDeliveryLog.js";
import { memoryStore } from "../services/memoryStore.js";
import { requireAuth } from "../middleware/auth.js";
import { generateWebhookSecret, sendTestWebhook } from "../services/webhookService.js";

const router = express.Router();
const hasMongo = () => mongoose.connection.readyState === 1;

const VALID_EVENTS = [
  "email.sent",
  "email.opened",
  "email.clicked",
  "email.failed",
  "sms.sent"
];

function validateSafeWebhookUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP and HTTPS webhook URLs are supported.";
    }
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host === "[::1]") {
      return "Localhost and loopback URLs are not permitted for security reasons.";
    }
    if (host === "169.254.169.254" || host.startsWith("169.254.")) {
      return "Cloud metadata service endpoints are strictly prohibited.";
    }
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return "Private network IP addresses are not permitted.";
    }
    return null;
  } catch {
    return "Invalid webhook URL format.";
  }
}

// All webhook management routes require active user authentication
router.use(requireAuth);

/**
 * GET /api/v1/webhooks
 * List all webhook endpoints for the current user.
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let endpoints;

    if (hasMongo()) {
      endpoints = await WebhookEndpoint.find({ userId }).sort({ createdAt: -1 });
    } else {
      endpoints = await memoryStore.listWebhookEndpoints(userId);
    }

    res.json({ endpoints: endpoints || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/webhooks
 * Create a new webhook endpoint.
 */
router.post("/", async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { url, description, events } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "A valid webhook destination URL is required." });
    }

    const trimmedUrl = url.trim();
    const urlError = validateSafeWebhookUrl(trimmedUrl);
    if (urlError) {
      return res.status(400).json({ error: urlError });
    }

    // Filter events against valid event list
    const filteredEvents = Array.isArray(events) && events.length > 0
      ? events.filter(e => VALID_EVENTS.includes(e) || e === "*")
      : VALID_EVENTS;

    const secret = generateWebhookSecret();

    let newEndpoint;
    if (hasMongo()) {
      newEndpoint = await WebhookEndpoint.create({
        userId,
        url: trimmedUrl,
        description: (description || "Production Webhook").trim(),
        secret,
        events: filteredEvents,
        isActive: true
      });
    } else {
      newEndpoint = await memoryStore.createWebhookEndpoint({
        userId,
        url: trimmedUrl,
        description: (description || "Production Webhook").trim(),
        secret,
        events: filteredEvents,
        isActive: true
      });
    }

    res.status(201).json({
      success: true,
      message: "Webhook endpoint registered successfully.",
      endpoint: newEndpoint
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/webhooks/:id
 * Update an existing webhook endpoint.
 */
router.put("/:id", async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { url, description, events, isActive } = req.body;

    const updates = {};
    if (url !== undefined) {
      const trimmedUrl = String(url).trim();
      const urlError = validateSafeWebhookUrl(trimmedUrl);
      if (urlError) {
        return res.status(400).json({ error: urlError });
      }
      updates.url = trimmedUrl;
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    if (Array.isArray(events)) {
      updates.events = events.filter(e => VALID_EVENTS.includes(e) || e === "*");
    }

    if (typeof isActive === "boolean") {
      updates.isActive = isActive;
    }

    let updatedEndpoint;
    if (hasMongo()) {
      updatedEndpoint = await WebhookEndpoint.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true }
      );
    } else {
      updatedEndpoint = await memoryStore.updateWebhookEndpoint(id, userId, updates);
    }

    if (!updatedEndpoint) {
      return res.status(404).json({ error: "Webhook endpoint not found." });
    }

    res.json({
      success: true,
      message: "Webhook endpoint updated successfully.",
      endpoint: updatedEndpoint
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/webhooks/:id/rotate-secret
 * Rotate the HMAC signing secret for a webhook endpoint.
 */
router.post("/:id/rotate-secret", async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const newSecret = generateWebhookSecret();

    let updatedEndpoint;
    if (hasMongo()) {
      updatedEndpoint = await WebhookEndpoint.findOneAndUpdate(
        { _id: id, userId },
        { $set: { secret: newSecret } },
        { new: true }
      );
    } else {
      updatedEndpoint = await memoryStore.updateWebhookEndpoint(id, userId, { secret: newSecret });
    }

    if (!updatedEndpoint) {
      return res.status(404).json({ error: "Webhook endpoint not found." });
    }

    res.json({
      success: true,
      message: "Webhook secret rotated successfully.",
      secret: newSecret
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/webhooks/:id
 * Delete a webhook endpoint.
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    let deleted = false;
    if (hasMongo()) {
      const result = await WebhookEndpoint.findOneAndDelete({ _id: id, userId });
      deleted = Boolean(result);
    } else {
      deleted = await memoryStore.deleteWebhookEndpoint(id, userId);
    }

    if (!deleted) {
      return res.status(404).json({ error: "Webhook endpoint not found." });
    }

    res.json({ success: true, message: "Webhook endpoint deleted successfully." });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/webhooks/:id/test
 * Send a test ping event to the specified endpoint and return the result.
 */
router.post("/:id/test", async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const result = await sendTestWebhook({ userId, endpointId: id });
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/webhooks/logs
 * Retrieve recent webhook delivery logs for the user.
 */
router.get("/logs", async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let logs;

    if (hasMongo()) {
      logs = await WebhookDeliveryLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);
    } else {
      logs = await memoryStore.listWebhookDeliveryLogs(userId, 50);
    }

    res.json({ logs: logs || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/webhooks/logs
 * Clear webhook delivery logs.
 */
router.delete("/logs", async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (hasMongo()) {
      await WebhookDeliveryLog.deleteMany({ userId });
    } else {
      await memoryStore.clearWebhookDeliveryLogs(userId);
    }

    res.json({ success: true, message: "Webhook delivery logs cleared." });
  } catch (error) {
    next(error);
  }
});

export default router;
