import { describe, expect, it } from "vitest";
import { getRequiredAdminRoles } from "../../storefront/src/lib/admin-rbac";

describe("storefront admin proxy RBAC policy", () => {
  it("leaves non-admin routes and admin login outside admin authorization", () => {
    expect(getRequiredAdminRoles("GET", ["products"])).toBeNull();
    expect(getRequiredAdminRoles("POST", ["admin", "auth", "login"])).toBeNull();
  });

  it("maps catalog, order, and editorial mutations to their roles", () => {
    expect(getRequiredAdminRoles("GET", ["admin", "dashboard"])).toEqual([]);
    expect(getRequiredAdminRoles("POST", ["admin", "products"])).toEqual([
      "CATALOG_MANAGER",
      "INVENTORY_MANAGER",
    ]);
    expect(getRequiredAdminRoles("PATCH", ["admin", "orders", "status"])).toEqual([
      "ORDER_MANAGER",
    ]);
    expect(getRequiredAdminRoles("POST", ["admin", "sections", "reorder"])).toEqual([
      "EDITOR",
    ]);
  });

  it("reserves financial, settings, review, audit, and unknown routes for super admins", () => {
    expect(getRequiredAdminRoles("PATCH", ["admin", "settings"])).toEqual(["SUPER_ADMIN"]);
    expect(getRequiredAdminRoles("POST", ["admin", "loyalty", "adjust"])).toEqual([
      "SUPER_ADMIN",
    ]);
    expect(getRequiredAdminRoles("GET", ["admin", "audit-logs"])).toEqual(["SUPER_ADMIN"]);
    expect(getRequiredAdminRoles("POST", ["admin", "future-sensitive-route"])).toEqual([
      "SUPER_ADMIN",
    ]);
  });

  it("matches the API rule that only super admins may delete banners", () => {
    expect(getRequiredAdminRoles("DELETE", ["admin", "banners", "banner-id"])).toEqual([
      "SUPER_ADMIN",
    ]);
  });
});
