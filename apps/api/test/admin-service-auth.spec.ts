import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { adminLookup, adminLoginLookup, adminUpdate, auditCreate } = vi.hoisted(() => ({
  adminLookup: vi.fn(),
  adminLoginLookup: vi.fn(),
  adminUpdate: vi.fn(),
  auditCreate: vi.fn(),
}));
vi.mock("../src/prisma", () => ({
  prisma: {
    adminUser: { findFirst: adminLookup, findUnique: adminLoginLookup, update: adminUpdate },
    auditLog: { create: auditCreate },
  },
}));

import { AdminService } from "../src/services/admin.service";

const ADMIN_JWT_SECRET =
  "admin-test-fixture-key-with-at-least-64-characters-abcdefghijklmnop";

function createAdminToken(role = "EDITOR") {
  return jwt.sign(
    {
      id: "admin-1",
      email: "stale-role@muschio.test",
      role,
      purpose: "admin",
    },
    ADMIN_JWT_SECRET,
    {
      expiresIn: "1h",
      issuer: "muschio-api",
      audience: "muschio-admin",
      algorithm: "HS256",
    },
  );
}

describe("AdminService.verifyToken", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_JWT_SECRET", ADMIN_JWT_SECRET);
    adminLookup.mockReset();
  });

  it("uses the active database account and current role instead of stale token claims", async () => {
    adminLookup.mockResolvedValue({
      id: "admin-1",
      email: "active@muschio.test",
      name: "Active Admin",
      role: "ORDER_MANAGER",
    });

    const admin = await AdminService.verifyToken(createAdminToken("EDITOR"));

    expect(adminLookup).toHaveBeenCalledWith({
      where: { id: "admin-1", isActive: true },
      select: { id: true, email: true, role: true, name: true },
    });
    expect(admin?.role).toBe("ORDER_MANAGER");
  });

  it("rejects a valid token when its administrator has been deactivated", async () => {
    adminLookup.mockResolvedValue(null);

    await expect(AdminService.verifyToken(createAdminToken())).resolves.toBeNull();
  });
});

describe("AdminService.login", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_JWT_SECRET", ADMIN_JWT_SECRET);
    adminLoginLookup.mockReset();
    adminUpdate.mockReset();
    auditCreate.mockReset();
  });

  it("returns an administrator token after valid credentials and records the login", async () => {
    adminLoginLookup.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.test",
      name: "Test Admin",
      role: "SUPER_ADMIN",
      passwordHash: bcrypt.hashSync("fixture-password", 4),
    });

    const result = await AdminService.login("admin@example.test", "fixture-password");

    expect(result.user.email).toBe("admin@example.test");
    expect(jwt.verify(result.token, ADMIN_JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "muschio-api",
      audience: "muschio-admin",
    })).toMatchObject({ id: "admin-1", purpose: "admin" });
    expect(adminUpdate).toHaveBeenCalledOnce();
    expect(auditCreate).toHaveBeenCalledOnce();
  });

  it("rejects unknown accounts without recording a login", async () => {
    adminLoginLookup.mockResolvedValue(null);

    await expect(AdminService.login("missing@example.test", "fixture-password")).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
    expect(adminUpdate).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });
});
