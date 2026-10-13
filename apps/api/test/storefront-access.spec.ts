import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
const db = vi.hoisted(() => ({
  cart: vi.fn(),
  reservation: vi.fn(),
  admin: vi.fn(),
}));
vi.mock("../src/prisma", () => ({
  prisma: {
    cart: { findFirst: db.cart },
    inventoryReservation: { findFirst: db.reservation },
    adminUser: { findFirst: db.admin },
  },
}));
import {
  createGuestSession,
  requireGuestSession,
  assertCartOwner,
  assertOrderOwner,
  signingSecret,
} from "../src/middleware/storefront-auth";
import { requireAdminAuth } from "../src/middleware/auth";
const secret =
  "storefront-test-fixture-key-with-64-characters-abcdefghijklmnop";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("JWT_SECRET", secret);
  vi.stubEnv("ADMIN_JWT_SECRET", secret + "-admin");
});
describe("storefront authorization", () => {
  it("creates unpredictable signed sessions without accepting a visitor-supplied id", () => {
    const first = createGuestSession(),
      second = createGuestSession();
    const one = jwt.verify(first, secret) as jwt.JwtPayload,
      two = jwt.verify(second, secret) as jwt.JwtPayload;
    expect(one.sub).not.toEqual(two.sub);
    const req = {
      headers: { "x-storefront-session": first },
      body: { guestSessionId: "other-visitor" },
    } as unknown as Request;
    const next = vi.fn();
    requireGuestSession(req, {} as Response, next);
    expect(req.guestSessionId).toBe(one.sub);
    expect(next).toHaveBeenCalledWith();
  });
  it("rejects missing, tampered, expired, wrong-audience, and wrong-purpose tokens", () => {
    const tokens = [
      undefined,
      createGuestSession() + "bad",
      jwt.sign({ purpose: "storefront" }, secret, {
        subject: "11111111-1111-4111-8111-111111111111",
        expiresIn: -1,
        issuer: "muschio-api",
        audience: "muschio-storefront",
      }),
      jwt.sign({ purpose: "admin" }, secret, {
        subject: "11111111-1111-4111-8111-111111111111",
        issuer: "muschio-api",
        audience: "muschio-storefront",
      }),
      jwt.sign({ purpose: "storefront" }, secret, {
        subject: "11111111-1111-4111-8111-111111111111",
        issuer: "muschio-api",
        audience: "another-app",
      }),
    ];
    for (const token of tokens) {
      const next = vi.fn();
      requireGuestSession(
        { headers: { "x-storefront-session": token } } as unknown as Request,
        {} as Response,
        next,
      );
      expect(next.mock.calls[0]?.[0]?.statusCode).toBe(401);
    }
  });
  it("uses non-enumerating failures for carts and orders belonging to another session", async () => {
    db.cart.mockResolvedValue(null);
    db.reservation.mockResolvedValue(null);
    await expect(assertCartOwner("cart", "session")).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(assertOrderOwner("order", "session")).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(db.cart).toHaveBeenCalledWith({
      where: { id: "cart", guestSessionId: "session", customerId: null },
      select: { id: true },
    });
    expect(db.reservation).toHaveBeenCalledWith({
      where: { orderId: "order", sessionId: "session" },
      select: { id: true },
    });
  });
  it("rejects disabled administrators even with a valid signed token", async () => {
    db.admin.mockResolvedValue(null);
    const token = jwt.sign(
      { id: "disabled-user", purpose: "admin" },
      secret + "-admin",
      { issuer: "muschio-api", audience: "muschio-admin" },
    );
    const next = vi.fn();
    await requireAdminAuth(
      { headers: { authorization: "Bearer " + token } } as unknown as Request,
      {} as Response,
      next,
    );
    expect(next.mock.calls[0]?.[0]?.statusCode).toBe(401);
  });
  it("fails closed when signing secrets are unset or match published examples", () => {
    for (const value of [
      "",
      "short",
      "super-secret-admin-jwt-key-muschio-luxury-perfumery-2026",
    ]) {
      vi.stubEnv("JWT_SECRET", value);
      expect(() => signingSecret("JWT_SECRET")).toThrow();
    }
  });
});
