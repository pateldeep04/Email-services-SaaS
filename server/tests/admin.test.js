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

  it("should provide cache statistics and allow cache flush", async () => {
    const statsRes = await request(app)
      .get("/api/v1/admin/cache/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.cache).toBeDefined();
    expect(statsRes.body.cache.keysCount).toBeDefined();

    const flushRes = await request(app)
      .post("/api/v1/admin/cache/flush")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(flushRes.status).toBe(200);
    expect(flushRes.body.cache.keysCount).toBe(0);
  });

  it("should allow admin to view and control user API keys (provision, toggle, rotate, delete)", async () => {
    // 1. Get first user
    const usersRes = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    const targetUser = usersRes.body.users[0];
    expect(targetUser).toBeDefined();

    // 2. Provision a new API key for the user
    const createKeyRes = await request(app)
      .post(`/api/v1/admin/users/${targetUser._id || targetUser.id}/keys`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Admin Test Key" });

    expect(createKeyRes.status).toBe(201);
    expect(createKeyRes.body.key).toBeDefined();
    expect(createKeyRes.body.key.key).toContain("mb_");
    const keyId = createKeyRes.body.key._id || createKeyRes.body.key.id;

    // 3. View user keys and verify unmasked key is returned
    const getKeysRes = await request(app)
      .get(`/api/v1/admin/users/${targetUser._id || targetUser.id}/keys`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getKeysRes.status).toBe(200);
    expect(Array.isArray(getKeysRes.body.keys)).toBe(true);
    const createdKey = getKeysRes.body.keys.find((k) => (k._id || k.id) === keyId);
    expect(createdKey).toBeDefined();
    expect(createdKey.isActive).toBe(true);

    // 4. Toggle active status to false (revoke)
    const toggleRes = await request(app)
      .patch(`/api/v1/admin/keys/${keyId}/toggle`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.key.isActive).toBe(false);

    // 5. Rotate key
    const rotateRes = await request(app)
      .post(`/api/v1/admin/keys/${keyId}/rotate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(rotateRes.status).toBe(200);
    expect(rotateRes.body.key.key).not.toBe(createdKey.key);
    expect(rotateRes.body.key.key).toContain("mb_");

    // 6. Delete key
    const deleteRes = await request(app)
      .delete(`/api/v1/admin/keys/${keyId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain("deleted");
  });
});

