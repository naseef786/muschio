import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();
let lastCleanup = Date.now();

function cleanupRateLimitStore() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  const cutoff = now - 60_000;
  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((t) => t > cutoff);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(ip: string, endpointKey: string, maxRequests: number, windowMs = 60_000): boolean {
  cleanupRateLimitStore();
  const now = Date.now();
  const key = `${ip}:${endpointKey}`;
  const record = rateLimitMap.get(key) || { timestamps: [] };
  record.timestamps = record.timestamps.filter((t) => t > now - windowMs);

  if (record.timestamps.length >= maxRequests) {
    return false;
  }

  record.timestamps.push(now);
  rateLimitMap.set(key, record);
  return true;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. API Route Protection & Sliding-Window Rate Limiting
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    let maxRequests = 120;
    let endpointKey = "api_general";

    if (pathname.includes("/auth/login")) {
      maxRequests = 10;
      endpointKey = "auth_login";
    } else if (pathname.includes("/checkout")) {
      maxRequests = 20;
      endpointKey = "checkout";
    } else if (pathname.includes("/search")) {
      maxRequests = 60;
      endpointKey = "search";
    } else if (pathname.includes("/enquiries")) {
      maxRequests = 12;
      endpointKey = "enquiries";
    }

    const isAllowed = checkRateLimit(ip, endpointKey, maxRequests, 60_000);

    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please wait a moment before trying again.",
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const res = NextResponse.next();
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  }

  // 2. Localization & Routing for Storefront Pages
  const res = intlMiddleware(req);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!admin|_next|_vercel|.*\\..*).*)",
  ],
};
