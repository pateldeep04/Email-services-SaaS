import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import app from "../index.js";

// Mock mongoose to avoid trying to establish real MongoDB connections during tests
vi.mock("mongoose", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    default: {
      ...original.default,
      connect: vi.fn().mockResolvedValue({}),
      connection: {
        ...original.default.connection,
        readyState: 0 // forces memoryStore fallback
      }
    }
  };
});

// Mock the emailService to avoid actual smtp transmissions
vi.mock("../services/emailService.js", () => {
  return {
    sendEmail: vi.fn().mockResolvedValue({
      status: "simulated",
      messageId: "mock-message-id",
      note: "Email simulated successfully."
    }),
    testSmtpConnection: vi.fn().mockResolvedValue({ success: true })
  };
});

describe("Email Templates API - Simple", () => {
  const apiKey = "mb_test_college_demo_key";
  const recipient = "recipient@example.com";

  beforeAll(() => {
    process.env.MAILBRIDGE_API_KEY = apiKey;
  });

  it("should fail to send simple email without an API key", async () => {
    const res = await request(app)
      .post("/api/v1/emails/simple")
      .send({ to: recipient, subject: "Test Simple", message: "Hello world" });
    expect(res.status).toBe(401);
  });

  it("should fail to send simple email with missing subject or message", async () => {
    const res = await request(app)
      .post("/api/v1/emails/simple")
      .set("x-api-key", apiKey)
      .send({ to: recipient });
    expect(res.status).toBe(400);
  });

  it("should successfully send simple email with button", async () => {
    const res = await request(app)
      .post("/api/v1/emails/simple")
      .set("x-api-key", apiKey)
      .send({
        to: recipient,
        subject: "Hello there",
        message: "Verify your email.",
        buttonText: "Click Me",
        buttonUrl: "https://example.com/click"
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("simulated");
    expect(res.body.messageId).toBe("mock-message-id");
  });
});
