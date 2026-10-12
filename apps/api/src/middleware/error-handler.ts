import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "@muschio/types";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.id || "unknown";
  const timestamp = new Date().toISOString();

  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload schema",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      meta: { requestId, timestamp },
    };
    return res.status(400).json(response);
  }

  if (err instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      meta: { requestId, timestamp },
    };
    return res.status(err.statusCode).json(response);
  }

  console.error(`[Unhandled Error] [${requestId}]`, err);

  const response: ApiResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please contact customer care.",
    },
    meta: { requestId, timestamp },
  };
  return res.status(500).json(response);
}
