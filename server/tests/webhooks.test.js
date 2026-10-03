import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { generateWebhookSecret, computeSignature } from "../services/webhookService.js";
import { memoryStore } from "../services/memoryStore.js";

describe("MailBridge Webhooks System", () => {
  it("should generate cryptographically secure secrets with whsec_ prefix", () => {
    const secret = generateWebhookSecret();
    expect(secret).toMatch(/^whsec_[a-f0-9]{48}$/);
  });

  it("should correctly compute and sign HMAC SHA-256 payload with timestamp", () => {
    const secret = "whsec_test_secret_1234567890abcdef";
    const timestamp = 1728000000;
    const payload = JSON.stringify({ event: "email.opened", data: { email: "lead@example.com" } });

    const header = computeSignature(payload, secret, timestamp);
    expect(header).toContain(`t=${timestamp},v1=`);

    // Verify signature manually
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${payload}`)
      .digest("hex");

    expect(header).toBe(`t=${timestamp},v1=${expectedSig}`);
  });

  it("should fail signature verification if payload is altered", () => {
    const secret = "whsec_test_secret_1234567890abcdef";
    const timestamp = 1728000000;
    const originalPayload = JSON.stringify({ event: "email.opened" });
    const tamperedPayload = JSON.stringify({ event: "email.clicked" });

    const header = computeSignature(originalPayload, secret, timestamp);
    const sigReceived = header.split("v1=")[1];

    const tamperedSig = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${tamperedPayload}`)
      .digest("hex");

    expect(sigReceived).not.toBe(tamperedSig);
  });

  it("should support full CRUD lifecycle for webhooks in memoryStore", async () => {
    const userId = "test_user_wh_123";
    const secret = generateWebhookSecret();

    // 1. Create
    const endpoint = await memoryStore.createWebhookEndpoint({
      userId,
      url: "https://my-api.com/webhook",
      description: "Test Webhook",
      secret,
      events: ["email.opened", "email.clicked"]
    });

    expect(endpoint).toBeDefined();
    expect(endpoint.url).toBe("https://my-api.com/webhook");
    expect(endpoint.events).toContain("email.opened");

    // 2. List
    const userEndpoints = await memoryStore.listWebhookEndpoints(userId);
    expect(userEndpoints.length).toBeGreaterThanOrEqual(1);

    // 3. Update
    const updated = await memoryStore.updateWebhookEndpoint(endpoint._id, userId, {
      description: "Updated Description",
      isActive: false
    });
    expect(updated.description).toBe("Updated Description");
    expect(updated.isActive).toBe(false);

    // 4. Create and list delivery logs
    await memoryStore.createWebhookDeliveryLog({
      userId,
      webhookEndpointId: endpoint._id,
      event: "email.opened",
      url: endpoint.url,
      payload: { id: "evt_123" },
      statusCode: 200,
      durationMs: 45,
      status: "success"
    });

    const logs = await memoryStore.listWebhookDeliveryLogs(userId);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].statusCode).toBe(200);

    // 5. Delete
    const deleted = await memoryStore.deleteWebhookEndpoint(endpoint._id, userId);
    expect(deleted).toBe(true);

    const afterDelete = await memoryStore.getWebhookEndpointById(endpoint._id, userId);
    expect(afterDelete).toBeNull();
  });
});
