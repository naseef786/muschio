import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales } from "./i18n";
import { getLegacyRedirect } from "./lib/seo-redirects";

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

// Malicious scrapers, vulnerability scanners, and automated spam attack agents
const BLOCKED_BOT_USER_AGENTS = [
  "sqlmap",
  "nikto",
  "masscan",
  "wpscan",
  "acunetix",
  "dirbuster",
  "havij",
  "zgrab",
  "censys",
  "shodan",
  "semrushbot",
  "ahrefsbot",
  "dotbot",
  "petalbot",
  "mj12bot",
];

function isMaliciousBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BLOCKED_BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // 0. Malicious Scraper & Exploit Bot Filtering
  if (isMaliciousBot(userAgent)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          code: "FORBIDDEN_AGENT",
          message: "Automated scan signature detected. Access denied.",
        },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Reject empty User-Agent on mutating POST/PUT/DELETE API endpoints (hallmark of raw bots)
  if (pathname.startsWith("/api/") && ["POST", "PUT", "DELETE", "PATCH"].includes(req.method) && !userAgent.trim()) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          code: "INVALID_CLIENT",
          message: "Valid User-Agent header is required for secure operations.",
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1. API Route Protection & Sliding-Window Rate Limiting
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    let maxRequests = 120;
    let endpointKey = "api_general";

    if (pathname.includes("/auth/login")) {
      maxRequests = 8;
      endpointKey = "auth_login";
    } else if (pathname.includes("/checkout")) {
      maxRequests = 20;
      endpointKey = "checkout";
    } else if (pathname.includes("/search")) {
      maxRequests = 60;
      endpointKey = "search";
    } else if (pathname.includes("/enquiries") || pathname.includes("/contact")) {
      maxRequests = 6; // 6 submissions per minute per IP to prevent spam flood
      endpointKey = "enquiries";
    } else if (pathname.includes("/reviews") && req.method === "POST") {
      maxRequests = 6; // 6 review submissions per minute
      endpointKey = "reviews_post";
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

  // 2. Google SEO Legacy 301 Permanent Redirect Engine
  // Intercepts historical Google-indexed URLs (Shopify, unlocalized paths, legacy categories, slug aliases)
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  const redirectTarget = getLegacyRedirect(pathname, req.nextUrl.search, cookieLocale);
  if (redirectTarget) {
    const redirectUrl = new URL(redirectTarget, req.url);
    const response = NextResponse.redirect(redirectUrl, 301);
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  // 3. Localization & Routing for Storefront Pages
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
