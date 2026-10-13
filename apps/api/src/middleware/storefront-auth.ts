import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { ApiError } from "./error-handler";

export function signingSecret(name: "JWT_SECRET" | "ADMIN_JWT_SECRET") {
  const secret = process.env[name];
  if (
    !secret ||
    secret.length < 32 ||
    /super-secret|replace|mock/i.test(secret)
  ) {
    throw new ApiError(
      503,
      "AUTH_NOT_CONFIGURED",
      "Authentication is not configured",
    );
  }
  return secret;
}
declare global {
  namespace Express {
    interface Request {
      guestSessionId?: string;
      rawBody?: Buffer;
    }
  }
}
export function createGuestSession() {
  return jwt.sign({ purpose: "storefront" }, signingSecret("JWT_SECRET"), {
    subject: randomUUID(),
    issuer: "muschio-api",
    audience: "muschio-storefront",
    algorithm: "HS256",
    expiresIn: "30d",
  });
}
export function requireGuestSession(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers["x-storefront-session"];
    if (typeof token !== "string")
      throw new ApiError(
        401,
        "SESSION_REQUIRED",
        "A storefront session is required",
      );
    const claims = jwt.verify(token, signingSecret("JWT_SECRET"), {
      algorithms: ["HS256"],
      issuer: "muschio-api",
      audience: "muschio-storefront",
    });
    const parsed = z
      .object({ sub: z.string().uuid(), purpose: z.literal("storefront") })
      .parse(claims);
    req.guestSessionId = parsed.sub;
    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(
            401,
            "INVALID_SESSION",
            "Invalid or expired storefront session",
          ),
    );
  }
}
export async function assertCartOwner(cartId: string, sessionId: string) {
  const cart = await prisma.cart.findFirst({
    where: { id: cartId, guestSessionId: sessionId, customerId: null },
    select: { id: true },
  });
  if (!cart) throw new ApiError(404, "CART_NOT_FOUND", "Cart not found");
}
export async function assertOrderOwner(orderId: string, sessionId: string) {
  // Reservations preserve the checkout session even after payment/release.
  const reservation = await prisma.inventoryReservation.findFirst({
    where: { orderId, sessionId },
    select: { id: true },
  });
  if (!reservation)
    throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
}
