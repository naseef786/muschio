import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

const { adminLookup } = vi.hoisted(() => ({ adminLookup: vi.fn() }));
vi.mock("../src/prisma", () => ({
  prisma: { adminUser: { findFirst: adminLookup } },
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
