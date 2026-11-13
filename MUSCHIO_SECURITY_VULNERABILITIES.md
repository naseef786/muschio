# MUSCHIO SECURITY VULNERABILITY AUDIT

**Date:** 2026-11-14
**Method:** defensive, read-only source review; dependency audit; build/test inspection; public response-header checks. No credential attacks, destructive tests, customer data access, high-volume scanning, or payment transactions were performed.

## Security verdict

**Rating: 3.0/10 — NO-GO.** Core commerce security has improved, but production dependency vulnerabilities and proxy-layer authorization gaps are launch blockers.

## Confirmed findings

### SEC-001 — Vulnerable production framework and import library

- **Priority/severity:** P0 / Critical
- **Affected:** `apps/storefront/package.json` (`next` 14.2.24); `apps/admin/package.json` and storefront dependency graph (`xlsx` 0.18.5)
- **Endpoint:** All Next.js routes; image optimizer; middleware; admin CSV/XLSX imports
- **Evidence:** `pnpm audit --prod` returned 45 advisories: 4 critical, 19 high, 19 moderate, 3 low. Critical Next advisories included authorization bypass and unauthenticated RCE advisories. SheetJS showed prototype-pollution and ReDoS advisories.
- **Prerequisites:** Vary by advisory and hosting/runtime. Windows-specific RCE is not assumed exploitable on Vercel Linux, but image/middleware/RSC advisories still make the deployed version unacceptable.
- **Impact:** Possible code execution, authentication bypass, denial of service, cache manipulation, or malicious spreadsheet processing.
- **Remediation:** Upgrade to a currently supported Next release containing all cited patches; upgrade/replace SheetJS using the vendor-supported distribution; pin and retest transitive dependencies.
- **Effort/dependencies:** 3-8 engineering days; framework migration and regression testing.
- **Acceptance criteria:** `pnpm audit --prod` contains no critical/high reachable advisories; full build, 88+ API tests, and new E2E suite pass.

### SEC-002 — Missing role enforcement in Next.js admin proxy

- **Priority/severity:** P0 / Critical authorization defect
- **Affected:** `apps/storefront/src/app/api/v1/[...route]/route.ts:127-133`, plus admin product/order/settings/promotion/return/audit handlers
- **Endpoint:** `/api/v1/admin/**`
- **Evidence:** The proxy verifies that a token belongs to an admin, but no role checks occur anywhere in the file. Sensitive handlers then operate for any authenticated admin. The Express API has `requireRoles`, but the production-facing proxy duplicates many operations without equivalent enforcement.
- **Prerequisites:** A valid lower-privileged admin token, such as an EDITOR account.
- **Impact:** Vertical privilege escalation to order/return management, settings changes, promotions, product deletion, and audit-log writes.
- **Remediation:** Centralize an explicit route/action permission matrix; enforce role/permission before every handler; remove duplicate proxy business logic and forward to the RBAC-protected API where possible.
- **Effort/dependencies:** 3-5 days; admin-role test fixtures.
- **Acceptance criteria:** EDITOR, ORDER_MANAGER, and SUPER_ADMIN negative/positive matrix tests cover every admin method and return 403 when unauthorized.

### SEC-003 — Admin bearer token and operational records stored in Web Storage

- **Priority/severity:** P1 / High
- **Affected:** `apps/admin/src/components/AdminLoginGate.tsx:70-74`; `apps/admin/src/App.tsx:307-335,350-356,799,1181-1192`
- **Endpoint:** Admin browser session
- **Evidence:** The full admin session is written to both localStorage and sessionStorage. Orders, returns, reviews, banners, sections, and other state are persisted in localStorage through a generic hook.
- **Prerequisites:** XSS, malicious extension, shared machine, stolen browser profile, or local device access.
- **Impact:** Token theft, durable session compromise, and exposure of customer/order operational data after logout.
- **Remediation:** Use Secure, HttpOnly, SameSite cookies with short-lived access and rotating refresh sessions; persist no PII/order payloads; clear all admin caches on logout; add CSP.
- **Effort/dependencies:** 4-7 days; API session changes.
- **Acceptance criteria:** No bearer token or customer/order record is readable from `localStorage`/`sessionStorage`; session revocation and logout tests pass.

### SEC-004 — Content Security Policy and modern isolation headers absent

- **Priority/severity:** P1 / High hardening gap
- **Affected:** `apps/storefront/next.config.mjs`; live responses
- **Endpoint:** All storefront/admin pages
- **Evidence:** Live responses had HSTS, nosniff, SAMEORIGIN, and referrer policy, but no CSP, Permissions-Policy, COOP, or CORP. Next config defines no headers.
- **Prerequisites:** A separate injection flaw or compromised third-party resource.
- **Impact:** Easier token exfiltration and script injection; broader browser capability exposure.
- **Remediation:** Deploy nonce/hash-based CSP in report-only mode, then enforce; add least-privilege Permissions-Policy and appropriate COOP/CORP.
- **Effort/dependencies:** 2-4 days plus monitoring.
- **Acceptance criteria:** Header scanner and browser console show enforced policy without blocked required resources.

### SEC-005 — Migration history is inconsistent with the configured database

- **Priority/severity:** P0 / High integrity and recovery risk
- **Affected:** `apps/api/prisma/migrations/**`; configured Neon database
- **Evidence:** `prisma migrate status` reports `20261003000000_init`, `20261112000000_add_loyalty_reservations`, and `20261113000000_add_payment_intent_reference` as unapplied.
- **Prerequisites:** Deployment, recovery, branch creation, or CI running `migrate deploy`.
- **Impact:** Failed deployment, duplicate-object errors, missing-column runtime failure, or unreproducible recovery.
- **Remediation:** Compare schema to migrations on an isolated Neon branch; create/baseline migration history; test deploy from empty and production-like branches; document restore.
- **Effort/dependencies:** 1-3 days; database backup/branch and DBA review.
- **Acceptance criteria:** `prisma migrate status` says up to date on isolated and production branches; clean bootstrap and rollback drill pass.

### SEC-006 — Order lookup verification uses reusable static identifiers

- **Priority/severity:** P2 / Medium
- **Affected:** `apps/api/src/routes/index.ts:511-548`
- **Endpoint:** `GET /orders/lookup/:orderNumber?email=...` or `?phone=...`
- **Evidence:** Lookup access can be granted by a matching email or exact phone; no one-time challenge is required. The storefront proxy masks PII, which materially reduces impact.
- **Prerequisites:** Knowledge of order number and customer email/phone.
- **Impact:** Exposure of order status/items and masked contact/address data; targeted privacy risk.
- **Remediation:** Send a short-lived OTP or signed lookup link; rate-limit by order, IP, and identifier; log failures.
- **Effort/dependencies:** 2-4 days; email/SMS delivery.
- **Acceptance criteria:** Order data is unavailable until a one-time proof is verified; abuse tests pass.

## Controls verified in current code

- Password-required customer login with bcrypt hashing and comparison.
- Admin login throttling and JWT verification.
- Server-authoritative price/tax/shipping/promotion calculations.
- Guest loyalty redemption rejected.
- Inventory reservations and transactional commit/release.
- Checkout idempotency key handling.
- Direct card charge endpoint disabled.
- Stripe hosted checkout amount/currency/order matching.
- Stripe webhook signature, livemode, reference, amount, and event-id checks.
- Masked non-admin tracking responses.
- Express API RBAC middleware and protected-route tests.

## Suspected or unverified risks

| Area | Status | Reason |
|---|---|---|
| Secret leakage | Not confirmed | Environment values were not printed or copied. Git history secret scan was not run. |
| CSRF | Partially mitigated | Bearer-token APIs are less exposed to classical CSRF; future cookie migration must add SameSite and CSRF controls. |
| XSS exploit | Not confirmed | No exploit was executed. Risk is amplified by missing CSP and web-storage tokens. |
| SSRF/file upload | Not fully verified | Cloudinary signing exists; MIME/content enforcement and callback egress were not dynamically tested. |
| Payment settlement | Not verified | No real or test-mode charge/webhook was initiated during this audit. |
| Rate limiting on proxy routes | Needs verification | Express routes have limiters; duplicated Next proxy behavior is inconsistent. |
| Logging/monitoring | Weak evidence | Audit logs exist, but no Sentry/SIEM/on-call alert integration was found. |

## Security test plan required before GO

1. Upgrade dependencies and rerun SCA with reachability review.
2. Add full RBAC method/route matrix tests for the proxy and Express API.
3. Execute OWASP ASVS-aligned authenticated tests on a non-production branch.
4. Test account enumeration, brute-force controls, JWT expiry/revocation, and session theft.
5. Test cart price, coupon, loyalty, shipping, and payment replay/tampering.
6. Test Stripe success/failure/async/expired/duplicate webhook paths in test mode.
7. Test IDOR across orders, returns, addresses, reviews, admin records, and uploads.
8. Validate CSP in report-only, then enforce.
9. Run backup restore and migration deploy on an isolated database branch.
10. Obtain independent penetration-test sign-off.
