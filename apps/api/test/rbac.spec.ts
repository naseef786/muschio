import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";
import { requireAdminAuth, requireRoles } from "../src/middleware/auth";
import { Request, Response, NextFunction } from "express";

const ADMIN_JWT_SECRET = "super-secret-admin-jwt-key-muschio-luxury-perfumery-2026";

describe("RBAC Authorization Middleware", () => {
  it("rejects requests missing authorization header with 401", () => {
    const req = { headers: {} } as Request;
    const res = {} as Response;
    const next = vi.fn();

    requireAdminAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });

  it("rejects requests with malformed Bearer token", () => {
    const req = { headers: { authorization: "Bearer " } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    requireAdminAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
  });

  it("authenticates valid admin token and attaches admin payload to request", () => {
    const payload = {
      id: "admin-1",
      email: "director@muschio.luxury",
      role: AdminRole.SUPER_ADMIN,
    };
    const token = jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: "1h" });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    requireAdminAuth(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.admin).toBeDefined();
    expect(req.admin?.email).toBe("director@muschio.luxury");
    expect(req.admin?.role).toBe(AdminRole.SUPER_ADMIN);
  });

  it("allows SUPER_ADMIN to bypass specific role requirements", () => {
    const req = {
      admin: {
        id: "admin-super",
        email: "super@muschio.luxury",
        role: AdminRole.SUPER_ADMIN,
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    const roleGuard = requireRoles([AdminRole.ORDER_MANAGER]);
    roleGuard(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("forbids non-matching roles with 403", () => {
    const req = {
      admin: {
        id: "admin-editor",
        email: "editor@muschio.luxury",
        role: AdminRole.EDITOR,
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    const roleGuard = requireRoles([AdminRole.INVENTORY_MANAGER, AdminRole.ORDER_MANAGER]);
    roleGuard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
  });
});
