import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import { initializeAdminUser } from "../services/adminService.js";

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

describe("Admin API Suite", () => {
  let adminToken = "";

  beforeAll(async () => {
    await initializeAdminUser();
  });

  it("should fail admin login with invalid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/admin/login")
      .send({ email: "admin@mailbridge.com", password: "wrongpassword123" });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Invalid administrator credentials");
  });

  it("should succeed in admin login with default initialized credentials", async () => {
    const res = await request(app)
      .post("/api/v1/admin/login")
      .send({ email: "admin@mailbridge.com", password: "Admin@123456" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("admin");
    adminToken = res.body.token;
  });

  it("should prevent regular client users from accessing admin routes", async () => {
    // 1. Register a regular client user
    const clientEmail = `client_${Date.now()}@example.com`;
    const regRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: clientEmail,
        name: "Regular Client",
        password: "Password123!",
        companyName: "Acme Corp"
      });

    expect(regRes.status).toBe(201);
    const clientToken = regRes.body.token;

    // 2. Client cannot login through admin portal
    const adminLoginRes = await request(app)
      .post("/api/v1/admin/login")
      .send({ email: clientEmail, password: "Password123!" });
    
    expect(adminLoginRes.status).toBe(403);
    expect(adminLoginRes.body.error).toContain("administrator privileges");

    // 3. Client token rejected on /api/v1/admin/stats
    const statsRes = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(statsRes.status).toBe(403);
  });

  it("should allow authenticated admin to access /api/v1/admin/stats", async () => {
    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toBeDefined();
    expect(res.body.emails).toBeDefined();
    expect(res.body.system).toBeDefined();
  });

  it("should allow authenticated admin to query user list", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.totalUsers).toBeGreaterThan(0);
  });

  it("should allow authenticated admin to query email logs", async () => {
    const res = await request(app)
      .get("/api/v1/admin/emails")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });
});
