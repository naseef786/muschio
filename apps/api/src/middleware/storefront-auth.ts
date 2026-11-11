import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { ApiError } from "./error-handler";

export function signingSecret(name: "JWT_SECRET" | "ADMIN_JWT_SECRET"): string {
  const secret = process.env[name];
  if (
    !secret ||
    secret.length < 32 ||
    /super-secret|replace|mock/i.test(secret)
  ) {
    throw new Error(
      `[SECURITY ERROR] Mandatory secret ${name} is unset, under 32 characters, or contains a placeholder. Server cannot run with insecure secrets.`
    );
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

export function verifyStorefrontToken(token: string): { customerId?: string; guestSessionId?: string; email?: string } | null {
  try {
    const claims = jwt.verify(token, signingSecret("JWT_SECRET"), {
      algorithms: ["HS256"],
      issuer: "muschio-api",
      audience: "muschio-storefront",
    }) as any;

    if (claims?.purpose !== "storefront") return null;

    const guestSessionId = claims.sub;
    const customerId = claims.customerId || (claims.role === "CUSTOMER" ? claims.sub : undefined);
    return {
      customerId,
      guestSessionId,
      email: claims.email,
    };
  } catch {
    return null;
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
  if (req.body?.customerId) {
    return next(
      new ApiError(
        403,
        "FORBIDDEN",
        "Direct customerId injection is prohibited",
      ),
    );
  }
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
    where: customerId
      ? {
          id: cartId,
          OR: [{ guestSessionId: sessionId }, { customerId }],
        }
      : {
          id: cartId,
          guestSessionId: sessionId,
          customerId: null,
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
  if ((prisma as any).order?.findUnique) {
    const order = await (prisma as any).order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true },
    });
    if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");

    if (customerId && order.customerId === customerId) {
      return;
    }
  }

  // Reservations preserve the checkout session even after payment/release.
  const reservation = await prisma.inventoryReservation.findFirst({
    where: { orderId, sessionId },
    select: { id: true },
  });
  if (reservation) return;

  throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
}
