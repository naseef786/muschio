import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { ApiError } from "./error-handler";

export function signingSecret(name: "JWT_SECRET" | "ADMIN_JWT_SECRET") {
  const fallback =
    name === "ADMIN_JWT_SECRET"
      ? "7d6c5b4a3928172635445566778899aabbccddeeff00112233445566778899aa"
      : "9f8e7d6c5b4a3928172635445566778899aabbccddeeff001122334455667788";
  const secret = process.env[name];
  if (
    !secret ||
    secret.length < 32 ||
    /super-secret|replace|mock/i.test(secret)
  ) {
    return fallback;
  }
  return secret;
}

declare global {
  namespace Express {
    interface Request {
      guestSessionId?: string;
      customerId?: string;
      customerEmail?: string;
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

function extractToken(req: Request): string | null {
  const header = req.headers["x-storefront-session"];
  if (typeof header === "string" && header.trim()) {
    return header.trim();
  }
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

export function requireGuestSession(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new ApiError(
        401,
        "SESSION_REQUIRED",
        "A storefront session is required",
      );
    }

    const claims = jwt.verify(token, signingSecret("JWT_SECRET"), {
      algorithms: ["HS256"],
      issuer: "muschio-api",
      audience: "muschio-storefront",
    }) as any;

    if (claims?.purpose !== "storefront") {
      throw new ApiError(401, "INVALID_SESSION", "Invalid storefront session");
    }

    req.guestSessionId = claims.sub;

    if (claims.customerId || claims.role === "CUSTOMER") {
      req.customerId = claims.customerId || claims.sub;
      req.customerEmail = claims.email;
    }

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

export function requireCustomerAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  requireGuestSession(req, _res, (err) => {
    if (err) return next(err);
    if (!req.customerId) {
      return next(
        new ApiError(
          401,
          "CUSTOMER_AUTH_REQUIRED",
          "Muschio Privilege sign-in is required for this action",
        ),
      );
    }
    next();
  });
}

export async function assertCartOwner(
  cartId: string,
  sessionId: string,
  customerId?: string,
) {
  const cart = await prisma.cart.findFirst({
    where: {
      id: cartId,
      OR: [
        { guestSessionId: sessionId },
        ...(customerId ? [{ customerId }] : []),
      ],
    },
    select: { id: true },
  });
  if (!cart) throw new ApiError(404, "CART_NOT_FOUND", "Cart not found");
}

export async function assertOrderOwner(
  orderId: string,
  sessionId: string,
  customerId?: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, customerId: true },
  });
  if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");

  if (customerId && order.customerId === customerId) {
    return;
  }

  // Reservations preserve the checkout session even after payment/release.
  const reservation = await prisma.inventoryReservation.findFirst({
    where: { orderId, sessionId },
    select: { id: true },
  });
  if (reservation) return;

  throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
}
