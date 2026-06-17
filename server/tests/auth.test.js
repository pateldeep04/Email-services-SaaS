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

describe("Authentication Rate Limiting", () => {
  it("should enforce a limit of 5 login attempts per email address", async () => {
    const testEmail = "attacker-target@example.com";

    // First 5 attempts should not be rate-limited by emailRateLimiter (returns 401 Unauthorized as user doesn't exist)
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testEmail, password: "wrongpassword" });
      
      expect(response.status).toBe(401);
    }

    // The 6th attempt with the same email should trigger the email rate limiter (429 Too Many Requests)
    const response6 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testEmail, password: "wrongpassword" });

    expect(response6.status).toBe(429);
    expect(response6.body.error).toContain("Too many login/registration attempts for this email");
  });
});
