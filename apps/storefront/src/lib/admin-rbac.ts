import type { AdminRole } from "@muschio/types";

const CATALOG_ROLES: AdminRole[] = ["CATALOG_MANAGER", "INVENTORY_MANAGER"];
const ORDER_ROLES: AdminRole[] = ["ORDER_MANAGER"];
const EDITOR_ROLES: AdminRole[] = ["EDITOR"];
const SUPER_ADMIN_ONLY: AdminRole[] = ["SUPER_ADMIN"];

const CATALOG_RESOURCES = new Set(["products", "tags", "brands", "notes", "collections", "scent-profiles"]);
const ORDER_RESOURCES = new Set(["orders", "enquiries", "messages", "returns"]);
const CUSTOMER_RESOURCES = new Set(["customers", "customer-guests"]);
const EDITOR_RESOURCES = new Set(["banners", "sections"]);
const SUPER_ADMIN_RESOURCES = new Set([
  "settings",
  "promotions",
  "coupons",
  "vouchers",
  "gift-cards",
  "loyalty",
  "reviews",
  "audit-logs",
  "notifications",
]);

/**
 * Returns the roles permitted to use an admin proxy route. An empty array means
 * any authenticated administrator; null means the route is not admin-protected.
 * Unknown admin resources fail closed to SUPER_ADMIN.
 */
export function getRequiredAdminRoles(method: string, route: string[]): AdminRole[] | null {
  if (route[0] === "media") return CATALOG_ROLES;
  if (route[0] !== "admin") return null;

  const path = route.join("/");
  if (method === "POST" && (path === "admin/auth/login" || path === "admin/login")) {
    return null;
  }

  const resource = route[1] || "";
  if (resource === "dashboard" || resource === "counts") return [];
  if (CATALOG_RESOURCES.has(resource)) return CATALOG_ROLES;
  if (CUSTOMER_RESOURCES.has(resource)) return ORDER_ROLES;
  if (ORDER_RESOURCES.has(resource)) return ORDER_ROLES;
  if (EDITOR_RESOURCES.has(resource)) {
    // Banner deletion is intentionally restricted to SUPER_ADMIN, matching the API.
    if (method === "DELETE" && resource === "banners") return SUPER_ADMIN_ONLY;
    return EDITOR_ROLES;
  }
  if (SUPER_ADMIN_RESOURCES.has(resource)) return SUPER_ADMIN_ONLY;

  return SUPER_ADMIN_ONLY;
}
