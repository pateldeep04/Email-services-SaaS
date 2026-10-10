import { describe, it, expect, vi } from "vitest";
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
        readyState: 0
      }
    }
  };
});

describe("Security & Registration OTP Suite", () => {
  const uniqueEmail = `test_secure_${Date.now()}@example.com`;
  let otpCode = "";

  it("should enforce security headers on API responses", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(res.headers["permissions-policy"]).toBeDefined();
  });

  it("should send a registration verification OTP", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register/send-otp")
      .send({ email: uniqueEmail, name: "Security Tester" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.debugOtp).toBeDefined();
    otpCode = res.body.debugOtp;
  });

  it("should reject registration with invalid or incorrect OTP", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: uniqueEmail,
        name: "Security Tester",
        password: "SecurePassword123!",
        companyName: "Security Co",
        otp: "999999" // wrong OTP
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid verification code");
  });

  it("should successfully register when providing the valid OTP", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: uniqueEmail,
        name: "Security Tester",
        password: "SecurePassword123!",
        companyName: "Security Co",
        otp: otpCode
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail);
  });

  it("should block SSRF attempts targeting localhost or cloud metadata in webhooks", async () => {
    // Login to get token
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: uniqueEmail, password: "SecurePassword123!" });

    const token = loginRes.body.token;

    // Attempt SSRF against localhost
    const ssrfLocalhost = await request(app)
      .post("/api/v1/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "http://localhost:5000/internal" });

    expect(ssrfLocalhost.status).toBe(400);
    expect(ssrfLocalhost.body.error).toContain("Localhost");

    // Attempt SSRF against AWS metadata
    const ssrfMetadata = await request(app)
      .post("/api/v1/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "http://169.254.169.254/latest/meta-data" });

    expect(ssrfMetadata.status).toBe(400);
    expect(ssrfMetadata.body.error).toContain("Cloud metadata");
  });

  it("should reject registration OTP request with disposable / temporary email", async () => {
    // 1. Temp-mail.org rotating domain from user's screenshot
    const tempRes1 = await request(app)
      .post("/api/v1/auth/register/send-otp")
      .send({ email: "hobab32329@18lover.com", name: "Spammer" });

    expect(tempRes1.status).toBe(400);
    expect(tempRes1.body.error).toContain("Disposable and temporary email addresses");

    // 2. Generic temp-mail.org
    const tempRes2 = await request(app)
      .post("/api/v1/auth/register/send-otp")
      .send({ email: "randomuser@temp-mail.org", name: "Spammer" });

    expect(tempRes2.status).toBe(400);
    expect(tempRes2.body.error).toContain("Disposable and temporary email addresses");

    // 3. Mailinator
    const tempRes3 = await request(app)
      .post("/api/v1/auth/register/send-otp")
      .send({ email: "fakeuser@mailinator.com", name: "Spammer" });

    expect(tempRes3.status).toBe(400);
    expect(tempRes3.body.error).toContain("Disposable and temporary email addresses");
  });

  it("should reject registration completion with disposable / temporary email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "attacker@18lover.com",
        name: "Disposable User",
        password: "Password123!",
        companyName: "Throwaway Corp"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Disposable and temporary email addresses");
  });
});

