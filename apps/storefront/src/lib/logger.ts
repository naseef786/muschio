/**
 * Production-ready Structured Logger for Muschio Storefront
 *
 * Provides JSON/structured log output in production, sanitized error tracking,
 * and automatic PII scrubbing (credit cards, passwords, tokens, auth headers).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

const PII_KEYS = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "cardNumber",
  "cvv",
  "exp",
  "creditCard",
];

function sanitize(value: any, depth = 0): any {
  if (depth > 5) return "[Truncated]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    // Redact 13-19 digit card numbers
    return value.replace(/\b(?:\d{4}[ -]?){3}\d{1,4}\b/g, "[REDACTED_CARD]");
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, depth + 1));
  }
  if (typeof value === "object") {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (PII_KEYS.some((pk) => k.toLowerCase().includes(pk.toLowerCase()))) {
        cleaned[k] = "[REDACTED]";
      } else {
        cleaned[k] = sanitize(v, depth + 1);
      }
    }
    return cleaned;
  }
  return value;
}

class Logger {
  private isProd = process.env.NODE_ENV === "production";

  private log(level: LogLevel, message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context: sanitize(context) } : {}),
    };

    if (this.isProd) {
      const line = JSON.stringify(entry);
      if (level === "error") {
        console.error(line);
      } else if (level === "warn") {
        console.warn(line);
      } else {
        console.log(line);
      }
    } else {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`;
      if (level === "error") {
        console.error(prefix, context || "");
      } else if (level === "warn") {
        console.warn(prefix, context || "");
      } else {
        console.log(prefix, context || "");
      }
    }
  }

  debug(message: string, context?: LogContext) {
    if (!this.isProd) {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, err?: any, context?: LogContext) {
    const errorDetails = err instanceof Error ? {
      name: err.name,
      message: err.message,
      stack: this.isProd ? undefined : err.stack,
    } : err;

    this.log("error", message, {
      ...context,
      error: errorDetails,
    });
  }
}

export const logger = new Logger();

