import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";
import { ApiError } from "./error-handler";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "super-secret-admin-jwt-key-muschio-luxury-perfumery-2026";

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

export function requireAdminAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "UNAUTHORIZED", "Admin authorization token is required"));
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Malformed authorization token"));
  }

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as unknown as AuthenticatedAdmin;
    req.admin = payload;
    return next();
  } catch (err) {
    return next(new ApiError(401, "INVALID_TOKEN", "Expired or invalid admin session"));
  }
}

export function requireRoles(roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    }
    if (!roles.includes(req.admin.role) && req.admin.role !== AdminRole.SUPER_ADMIN) {
      return next(new ApiError(403, "FORBIDDEN", "Insufficient permissions for this operation"));
    }
    return next();
  };
}
