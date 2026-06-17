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

describe("Backend Health API", () => {
  it("should return ok: true and service info", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("ok", true);
    expect(response.body).toHaveProperty("service", "MailBridge Email API");
  });
});
