import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";
import { ApiError } from "./error-handler";
import { signingSecret } from "./storefront-auth";
import { prisma } from "../prisma";
import { z } from "zod";

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export async function requireAdminAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError(
        401,
        "UNAUTHORIZED",
        "Admin authorization token is required",
      ),
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(
      new ApiError(401, "UNAUTHORIZED", "Malformed authorization token"),
    );
  }

  try {
    const payload = z
      .object({ id: z.string(), purpose: z.literal("admin") })
      .parse(
        jwt.verify(token, signingSecret("ADMIN_JWT_SECRET"), {
          algorithms: ["HS256"],
          issuer: "muschio-api",
          audience: "muschio-admin",
        }),
      );
    const user = await prisma.adminUser.findFirst({
      where: { id: payload.id, isActive: true },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new Error("Inactive admin");
    req.admin = user;
    return next();
  } catch (err) {
    return next(
      err instanceof ApiError
        ? err
        : new ApiError(
            401,
            "INVALID_TOKEN",
            "Expired or invalid admin session",
          ),
    );
  }
}

export function requireRoles(roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    }
    if (
      !roles.includes(req.admin.role) &&
      req.admin.role !== AdminRole.SUPER_ADMIN
    ) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "Insufficient permissions for this operation",
        ),
      );
    }
    return next();
  };
}
