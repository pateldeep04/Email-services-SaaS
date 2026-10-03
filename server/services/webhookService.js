import crypto from "crypto";
import mongoose from "mongoose";
import WebhookEndpoint from "../models/WebhookEndpoint.js";
import WebhookDeliveryLog from "../models/WebhookDeliveryLog.js";
import { memoryStore } from "./memoryStore.js";

const hasMongo = () => mongoose.connection.readyState === 1;

/**
 * Generate a cryptographically secure webhook secret.
 */
export function generateWebhookSecret() {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}

/**
 * Compute an HMAC SHA-256 signature for a webhook payload.
 * Follows the standard Stripe/Resend format: t=<timestamp>,v1=<signature>
 */
export function computeSignature(payloadString, secret, timestamp) {
  const signedPayload = `${timestamp}.${payloadString}`;
  const signature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Deliver a single webhook event to an endpoint.
 */
async function deliverToEndpoint(endpoint, event, eventPayload) {
  const deliveryId = "del_" + crypto.randomBytes(12).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(eventPayload);
  const signatureHeader = computeSignature(payloadString, endpoint.secret, timestamp);

  const startTime = Date.now();
  let statusCode = 0;
  let responseBody = "";
  let status = "failed";
  let errorMsg = "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MailBridge-Webhooks/1.0",
        "X-MailBridge-Event": event,
        "X-MailBridge-Delivery": deliveryId,
        "X-MailBridge-Signature": signatureHeader
      },
      body: payloadString,
      signal: controller.signal
    });

    clearTimeout(timeout);
    statusCode = response.status;
    const rawText = await response.text();
    responseBody = (rawText || "").slice(0, 500); // Record up to 500 chars of response

    if (response.ok) {
      status = "success";
    } else {
      status = "failed";
      errorMsg = `Endpoint returned HTTP status ${statusCode}: ${responseBody.slice(0, 100)}`;
    }
  } catch (err) {
    status = "failed";
    errorMsg = err.name === "AbortError" ? "Request timed out after 8000ms" : (err.message || "Network delivery failed");
  }

  const durationMs = Date.now() - startTime;

  // Persist the delivery log
  const logData = {
    userId: endpoint.userId,
    webhookEndpointId: endpoint._id,
    event,
    url: endpoint.url,
    payload: eventPayload,
    statusCode,
    responseBody,
    durationMs,
    status,
    error: errorMsg
  };

  try {
    if (hasMongo()) {
      await WebhookDeliveryLog.create(logData);
    } else {
      await memoryStore.createWebhookDeliveryLog(logData);
    }
  } catch (logErr) {
    console.error("Failed to persist webhook delivery log:", logErr.message);
  }

  return {
    deliveryId,
    statusCode,
    status,
    durationMs,
    responseBody,
    error: errorMsg
  };
}

/**
 * Dispatch an event to all active endpoints subscribed to it for a given user.
 * Non-blocking: will not throw errors to calling functions.
 */
export async function dispatchWebhook({ userId, event, data }) {
  if (!userId || !event) return;

  try {
    let endpoints = [];
    if (hasMongo()) {
      endpoints = await WebhookEndpoint.find({
        userId,
        isActive: true,
        $or: [{ events: event }, { events: "*" }]
      });
    } else {
      const all = await memoryStore.listWebhookEndpoints(userId);
      endpoints = all.filter(e => e.isActive && (e.events.includes(event) || e.events.includes("*")));
    }

    if (!endpoints || endpoints.length === 0) return;

    const eventPayload = {
      id: "evt_" + crypto.randomBytes(12).toString("hex"),
      event,
      createdAt: new Date().toISOString(),
      data: data || {}
    };

    // Dispatch asynchronously in parallel to all endpoints
    await Promise.allSettled(
      endpoints.map(endpoint => deliverToEndpoint(endpoint, event, eventPayload))
    );
  } catch (err) {
    console.error(`[Webhook Dispatch Error] Failed to dispatch event "${event}":`, err.message);
  }
}

/**
 * Trigger an immediate test webhook ping for developer verification.
 */
export async function sendTestWebhook({ userId, endpointId }) {
  let endpoint = null;

  if (hasMongo()) {
    endpoint = await WebhookEndpoint.findOne({ _id: endpointId, userId });
  } else {
    endpoint = await memoryStore.getWebhookEndpointById(endpointId, userId);
  }

  if (!endpoint) {
    throw new Error("Webhook endpoint not found or unauthorized.");
  }

  const testPayload = {
    id: "evt_test_" + crypto.randomBytes(8).toString("hex"),
    event: "test.ping",
    createdAt: new Date().toISOString(),
    data: {
      message: "Hello from MailBridge! Your webhook endpoint is successfully configured and receiving events.",
      endpointId: String(endpoint._id),
      url: endpoint.url,
      timestamp: new Date().toISOString(),
      platform: "MailBridge Webhooks Service",
      status: "operational"
    }
  };

  return await deliverToEndpoint(endpoint, "test.ping", testPayload);
}
