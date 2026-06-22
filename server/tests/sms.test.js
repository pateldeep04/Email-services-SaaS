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

describe("SMS OTP API", () => {
  const apiKey = "mb_test_college_demo_key";
  const testPhone = "+15550199";

  beforeAll(() => {
    process.env.MAILBRIDGE_API_KEY = apiKey;
    process.env.SMS_SIMULATION_MODE = "true";
  });

  it("should fail to request SMS OTP without an API key", async () => {
    const res = await request(app)
      .post("/api/v1/sms/otp")
      .send({ to: testPhone });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Missing API key");
  });

  it("should succeed in requesting SMS OTP in simulated mode with API key", async () => {
    const res = await request(app)
      .post("/api/v1/sms/otp")
      .set("x-api-key", apiKey)
      .send({ to: testPhone });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("simulated");
    expect(res.body.code).toBeDefined(); // returned code because it's simulated
  });

  it("should verify a valid SMS OTP code", async () => {
    // 1. Request OTP
    const otpRes = await request(app)
      .post("/api/v1/sms/otp")
      .set("x-api-key", apiKey)
      .send({ to: testPhone });
    expect(otpRes.status).toBe(201);
    const code = otpRes.body.code;

    // 2. Verify OTP
    const verifyRes = await request(app)
      .post("/api/v1/sms/verify-otp")
      .set("x-api-key", apiKey)
      .send({ to: testPhone, code });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.verified).toBe(true);
  }, 15000);

  it("should fail to verify an incorrect SMS OTP code", async () => {
    // 1. Request OTP
    const otpRes = await request(app)
      .post("/api/v1/sms/otp")
      .set("x-api-key", apiKey)
      .send({ to: testPhone });
    expect(otpRes.status).toBe(201);

    // 2. Verify with wrong code
    const verifyRes = await request(app)
      .post("/api/v1/sms/verify-otp")
      .set("x-api-key", apiKey)
      .send({ to: testPhone, code: "000000" });
    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.verified).toBe(false);
  }, 15000);
});
