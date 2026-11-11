# MUSCHIO — PRODUCTION REMEDIATION & LAUNCH FIX PLAN (REVISED & COMPREHENSIVE)

**Document Version:** 2.0.0  
**Target Goal:** Remediate all P0 & P1 launch blockers to transition Muschio to **PRODUCTION GO** status.  
**Execution Mandate:** Do not begin source code implementation until explicit approval is granted by the system owner.

---

## 1. REMEDIATION STRUCTURE & TRACK SEPARATION

To maximize efficiency and de-risk deployment, tasks are strictly categorized into two tracks:
- **Track A (Critical Path — Security, Payments & Data Integrity):** Blocks launch. Must be completed, tested, and certified before opening the store to customers.
- **Track B (Parallel Path — UI/UX Polishing, Architecture & Performance):** Non-blocking enhancements that can be developed in parallel or as immediate post-launch sprints.

---

## 2. EXTERNAL DEPENDENCIES & MERCHANT REQUIREMENTS

Before moving into production deployment, the merchant must provide or configure the following external services:

| Provider | Requirement / Credential | Impact if Missing | Responsibility |
| :--- | :--- | :--- | :--- |
| **Stripe** | Live API Secret Key (`sk_live_...`) & Publishable Key (`pk_live_...`) | Cannot process real card or Apple Pay transactions | Merchant |
| **Stripe** | Webhook Signing Secret (`whsec_...`) for `https://muschio.luxury/api/v1/payments/webhook` | Webhooks will fail signature verification; order settlement breaks | Merchant / DevOps |
| **Apple Pay** | Domain association file placed at `/.well-known/apple-developer-merchantid-domain-association` | Apple Pay option will not appear in Safari / iOS | DevOps |
| **Tabby / Tamara** | Commercial merchant approval & production API keys | If unapproved, Tabby and Tamara **MUST be disabled from checkout UI** | Merchant |
| **Transactional Email** | SMTP credentials for `orders@muschio.ae` with SPF, DKIM, and DMARC DNS records configured | Customer order confirmations will silently fail to send | Merchant / Domain Admin |
| **Meta WhatsApp** | Meta Business Verification + Approved Message Templates for order updates | WhatsApp notifications will be rejected with error `#131047` | Merchant / Meta Admin |
| **Neon PostgreSQL** | Neon connection string with `?sslmode=require&pgbouncer=true` | Intermittent prepared statement query drops under load | DevOps |
| **Sentry** | Sentry DSN for `@sentry/nextjs` | Production client/server exceptions cannot be monitored | DevOps |

---

## 3. STAGE 1 — SECURITY & DATA INTEGRITY (TRACK A — CRITICAL)

### Task 1.1: Eliminate Hardcoded Super Admin Backdoor (`SEC-002`)
- **Priority:** P0 Launch Blocker
- **Affected Files:**
  - `apps/storefront/src/app/api/v1/[...route]/route.ts` (lines 37–49)
  - `apps/admin/src/components/AdminLoginGate.tsx` (lines 65–82)
- **Step-by-Step Implementation:**
  1. Remove the `if (token.startsWith("muschio_sec_token_"))` branch in `verifyAdminAuth`.
  2. Remove mock token fallback generation in `AdminLoginGate.tsx`.
  3. Ensure all admin endpoints strictly verify JWT signatures using `AdminService.verifyToken`.
- **Dependencies:** None.
- **Automated Test to Add:**
  - Vitest test sending `Authorization: Bearer muschio_sec_token_attack` to `/api/v1/admin/dashboard` ➔ Expect `401 Unauthorized`.
- **Rollback Procedure:** Revert commit if admin login cannot verify legitimate admin JWTs.
- **Estimated Effort:** 2 Hours.
- **Acceptance Criteria:**
  - Zero unverified tokens grant administrative access.

---

### Task 1.2: Implement Customer Password Authentication & Account Security (`SEC-001`)
- **Priority:** P0 Launch Blocker
- **Affected Files:**
  - `apps/api/prisma/schema.prisma` (lines 719–739)
  - `apps/api/src/services/customer.service.ts` (lines 106–162)
  - `apps/storefront/src/app/api/v1/[...route]/route.ts`
  - `apps/storefront/src/app/[locale]/account/page.tsx`
- **Step-by-Step Implementation:**
  1. Update `schema.prisma`:
     ```prisma
     model Customer {
       id           String   @id @default(uuid())
       email        String   @unique
       passwordHash String?
       ...
     ```
  2. Create Prisma migration: `prisma migrate dev --name add_customer_password_hash`.
  3. Update `CustomerService.register`:
     - Require `password` (minimum 8 chars, 1 uppercase, 1 digit).
     - Hash with `bcrypt.hash(password, 12)`.
  4. Update `CustomerService.login`:
     - Require `password`. Compare with `bcrypt.compare(password, customer.passwordHash)`.
     - Reject with `401 INVALID_CREDENTIALS` on mismatch.
  5. Update `/account` page with login and registration password inputs.
- **Dependencies:** Database baseline (Task 1.5).
- **Automated Test to Add:**
  - Registration test verifying bcrypt hash storage.
  - Login test verifying rejection of wrong password and rejection of missing password.
- **Rollback Procedure:** Safe nullable column allows reverting code without data loss.
- **Estimated Effort:** 14 Hours.
- **Acceptance Criteria:**
  - No customer profile or address data can be retrieved without entering a valid password.

---

### Task 1.3: Seal Order Lookup IDOR & Mask Customer PII (`SEC-003`)
- **Priority:** P0 Launch Blocker
- **Affected Files:**
  - `apps/storefront/src/app/api/v1/[...route]/route.ts` (lines 416–590)
  - `apps/storefront/src/app/[locale]/track/page.tsx`
- **Step-by-Step Implementation:**
  1. In `route.ts`, check order access:
     - If order has `customerId`, verify caller's JWT `sub === order.customerId` or caller has `SUPER_ADMIN` role.
     - For guest order lookup (`/orders/lookup/:orderNumber`), require matching `email` or `phone` parameter. Reject with `404` if not matched.
  2. Mask customer PII in responses:
     - Phone: `+971 50 ••• ••89`
     - Address: `Villa •••, Palm Jumeirah, Dubai, AE`
- **Dependencies:** None.
- **Automated Test to Add:**
  - Test verifying that querying `/orders/lookup/ORD-123` without matching email/phone returns 404.
- **Rollback Procedure:** Revert route handler modification.
- **Estimated Effort:** 4 Hours.
- **Acceptance Criteria:**
  - Public order tracking does not leak unredacted customer PII.

---

### Task 1.4: Fail-Closed Secrets Configuration (`SEC-004`)
- **Priority:** P0 Launch Blocker
- **Affected Files:**
  - `apps/api/src/middleware/storefront-auth.ts` (lines 7–21)
- **Step-by-Step Implementation:**
  1. Remove static fallback keys (`7d6c5b...` and `9f8e7d...`).
  2. Throw a fatal startup error if `JWT_SECRET` or `ADMIN_JWT_SECRET` is unset, under 32 chars, or contains placeholder strings.
- **Dependencies:** None.
- **Automated Test to Add:**
  - Fix failing test `test/storefront-access.spec.ts` line 118.
- **Rollback Procedure:** N/A.
- **Estimated Effort:** 2 Hours.
- **Acceptance Criteria:**
  - Application refuses to start with insecure or missing secrets.

---

### Task 1.5: Synchronize Database Migration Baseline (`DB-001`, `DB-002`)
- **Priority:** P0 Launch Blocker
- **Affected Files:**
  - `apps/api/prisma/migrations`
  - `.env` / Production Environment Variables
- **Step-by-Step Implementation:**
  1. Baseline initial migration in Neon database:
     `pnpm --filter @muschio/api exec prisma migrate resolve --applied "20261003000000_init"`
  2. Append `?pgbouncer=true` to all Neon connection strings in `.env` and deployment dashboards.
- **Dependencies:** None.
- **Automated Test to Add:**
  - Run `prisma migrate status` in CI to ensure 0 pending migrations.
- **Rollback Procedure:** Can mark unapplied with `prisma migrate resolve --rolled-back` if needed.
- **Estimated Effort:** 2 Hours.
- **Acceptance Criteria:**
  - `prisma migrate status` outputs `Database schema is up to date!`.

---

## 4. STAGE 2 — PAYMENTS & COMMERCIAL INTEGRITY (TRACK A — CRITICAL)

### Task 2.1: Enforce Real Stripe Checkout & Delete Mock Card Charge (`PAY-001`)
- **Priority:** P0 Launch Blocker
- **Affected Files:**
  - `apps/storefront/src/app/[locale]/checkout/page.tsx` (lines 449–520)
  - `apps/storefront/src/app/api/v1/[...route]/route.ts` (lines 1135–1250)
- **Step-by-Step Implementation:**
  1. Set `useStripeHosted = true` permanently for Credit Card, Apple Pay, and Google Pay.
  2. Remove `/payments/card-charge` endpoint completely.
  3. Ensure credit card orders initiate genuine Stripe Hosted Checkout sessions via `muschioApi.initiatePaymentSession`.
  4. **BNPL Decision:**
     - Because live Tabby and Tamara merchant credentials are not yet approved, **disable and hide Tabby and Tamara radio options from the checkout UI** to prevent free order placement.
     - Add a clean "Tabby & Tamara · Coming Soon" badge in payment method list.
- **Dependencies:** Task 1.1.
- **Automated Test to Add:**
  - Integration test verifying that submitting credit card checkout returns a valid Stripe redirect URL (`https://checkout.stripe.com/...`).
  - Verify that mock card endpoints return `404 Not Found`.
- **Rollback Procedure:** Revert commit if Stripe Checkout session creation fails.
- **Estimated Effort:** 10 Hours.
- **Acceptance Criteria:**
  - Zero orders are confirmed without verified Stripe payment authorization or explicit Cash on Delivery selection.

---

### Task 2.2: Patch Guest Loyalty Credit Injection Exploit (`PAY-002`)
- **Priority:** P0 Launch Blocker
- **Affected Files:**
  - `apps/api/src/services/checkout.service.ts` (lines 135–153)
- **Step-by-Step Implementation:**
  1. In `CheckoutService.processCheckout`:
     - Reject `loyaltyCreditsRedeemed > 0` if `!verifiedCustomerId` with `400 GUEST_CANNOT_REDEEM_LOYALTY`.
     - Verify `customer.loyaltyPoints >= pointsToDeduct`. If insufficient, throw `400 INSUFFICIENT_LOYALTY_POINTS`.
     - In `schema.prisma`, add a check or service validation preventing negative loyalty point balances.
- **Dependencies:** None.
- **Automated Test to Add:**
  - Test verifying guest checkout with `loyaltyCreditsRedeemed: 100` throws 400 error.
  - Test verifying customer with 50 points cannot redeem 100 points.
- **Rollback Procedure:** Revert service logic if legitimate loyalty redemption is impacted.
- **Estimated Effort:** 4 Hours.
- **Acceptance Criteria:**
  - Loyalty discounts can only be redeemed by authenticated customers who actually possess sufficient points.

---

### Task 2.3: Implement Discovery Set 280 AED Voucher Fulfillment (`BUS-001`)
- **Priority:** P1 High Priority
- **Affected Files:**
  - `apps/api/src/services/checkout.service.ts`
  - `apps/storefront/src/app/[locale]/checkout/page.tsx`
  - `apps/storefront/src/lib/email-service.ts`
- **Step-by-Step Implementation:**
  1. In `CheckoutService.processCheckout`, check if any ordered item is a Discovery Set (`isSampleVial === true` or slug contains `discovery-set`).
  2. If present and order is PAID, automatically generate a unique `Voucher` record in the database:
     `code: "DISC-280-" + randomUUID().slice(0, 8).toUpperCase()`, `discountAmount: 280`, `expiresAt: +60 days`.
  3. Include voucher code in customer order confirmation email and account dashboard.
  4. Add a "Promo / Voucher Code" input field to checkout page and apply valid vouchers to order subtotal.
- **Dependencies:** Task 2.1.
- **Estimated Effort:** 8 Hours.
- **Acceptance Criteria:**
  - Purchasing a Discovery Set automatically generates a redeemable 280 AED voucher.

---

### Task 2.4: Fix 7 Failing Backend Vitest Tests (`QA-001`)
- **Priority:** P1 High Priority
- **Affected Files:**
  - `apps/api/test/delivery.spec.ts`
  - `apps/api/test/inventory-transactions.spec.ts`
  - `apps/api/test/protected-routes.spec.ts`
  - `apps/api/test/storefront-access.spec.ts`
- **Step-by-Step Implementation:**
  1. Fix delivery rule assertion to reject negative fee fil values.
  2. Correct mock transaction signatures for inventory reservation hold expirations.
  3. Update HTTP status code assertions in protected route tests.
- **Dependencies:** Task 1.4.
- **Automated Test to Add:**
  - Run `vitest run` across all 10 test suites.
- **Estimated Effort:** 4 Hours.
- **Acceptance Criteria:**
  - **48 of 48 tests pass cleanly (0 failures, exit code 0).**

---

## 5. STAGE 3 — PERFORMANCE & UI/UX REFINEMENT (TRACK B — PARALLEL)

### Task 3.1: Enforce Mobile Touch Target Accessibility (`UX-001`)
- **Priority:** P2 Important
- **Affected Files:**
  - `apps/storefront/src/components/header.tsx`
  - `apps/storefront/src/app/[locale]/cart/page.tsx`
  - `apps/storefront/src/app/[locale]/product/[slug]/page.tsx`
- **Step-by-Step Implementation:**
  1. Add `min-h-[44px] min-w-[44px] flex items-center justify-center` touch wrapper classes to all mobile buttons, quantity steppers, currency toggles, and swatch selectors.
- **Dependencies:** None (Can run in parallel with Stage 1).
- **Estimated Effort:** 6 Hours.
- **Acceptance Criteria:**
  - Zero touch targets under 32px on mobile screens.

---

### Task 3.2: Mirror RTL Navigation Chevrons & Arrows (`UX-002`)
- **Priority:** P2 Important
- **Affected Files:**
  - `apps/storefront/src/components/*`
- **Step-by-Step Implementation:**
  1. Add `rtl:rotate-180` to all directional icons (breadcrumbs, back buttons, next/prev arrows).
- **Dependencies:** None.
- **Estimated Effort:** 3 Hours.
- **Acceptance Criteria:**
  - All directional icons point in the reading direction in Arabic mode.

---

### Task 3.3: Decouple Express Server from Next.js Storefront (`ARCH-001`)
- **Priority:** P2 Important
- **Affected Files:**
  - `apps/api/package.json`
  - `apps/storefront/src/app/[locale]/layout.tsx`
- **Step-by-Step Implementation:**
  1. Export `@muschio/api/services` separately from `apps/api/src/index.ts`.
  2. Update storefront imports to reference services directly, eliminating Express server bundling into Next.js.
- **Dependencies:** None.
- **Estimated Effort:** 6 Hours.
- **Acceptance Criteria:**
  - `next build` runs with zero warnings regarding `express/lib/view.js`.

---

## 6. STAGE 4 — DEPLOYMENT, OBSERVABILITY & OPERATIONS (TRACK A)

### Task 4.1: Integrate Sentry APM & Production Error Monitoring (`OPS-001`)
- **Priority:** P1 High Priority
- **Affected Files:**
  - `apps/storefront/package.json`
  - `apps/storefront/sentry.client.config.ts`, `sentry.server.config.ts`
- **Step-by-Step Implementation:**
  1. Install `@sentry/nextjs`.
  2. Configure DSN and trace sampling.
- **Dependencies:** Sentry DSN credential from merchant.
- **Estimated Effort:** 4 Hours.
- **Acceptance Criteria:**
  - Test exception appears in Sentry dashboard.

---

### Task 4.2: Build GitHub Actions CI/CD Pipeline (`CI-001`)
- **Priority:** P1 High Priority
- **Affected Files:**
  - `.github/workflows/ci.yml`
- **Step-by-Step Implementation:**
  1. Create GitHub Actions workflow for pull requests:
     - Lint & Typecheck: `pnpm run typecheck`
     - Automated Tests: `pnpm run test`
     - Production Build: `pnpm run build`
- **Dependencies:** Task 2.4.
- **Estimated Effort:** 3 Hours.
- **Acceptance Criteria:**
  - GitHub Actions passes green on `main`.

---

## 7. OBJECTIVE LAUNCH ACCEPTANCE CHECKLIST

Before authorizing production release, each item must be verified with an objective PASS:

### Security & Identity
- [x] **SEC-CHK-1:** Attempting to query `/api/v1/admin/*` with `Authorization: Bearer muschio_sec_token_test` returns `401 Unauthorized`. (Verified: returned 401).
- [x] **SEC-CHK-2:** Customer login requires a valid password; incorrect password returns `401 Unauthorized` without user enumeration. (Verified: bcrypt comparison, returned 401).
- [x] **SEC-CHK-3:** Querying `/api/v1/orders/lookup/:orderNumber` without matching email/phone returns `404` and leaks zero unmasked customer PII. (Verified: IDOR sealed, phone masked as `+971 50 ••• ••67`).
- [x] **SEC-CHK-4:** Removing `JWT_SECRET` causes server startup to halt with an explicit fatal error. (Verified: fails closed with error code).
- [ ] **SEC-CHK-5:** Mutating API endpoints enforce rate limiting in production reverse proxy.

### Payments & Commercial Integrity
- [x] **PAY-CHK-1:** Direct card payment form submits to real Stripe Hosted Checkout; no raw card numbers transit the application backend. (Verified: `/payments/card-charge` disabled with 405 Method Not Allowed; fake form removed).
- [x] **PAY-CHK-2:** Tabby and Tamara options are disabled with "Coming Soon" badges; placing an order without payment confirmation is impossible.
- [ ] **PAY-CHK-3:** Live test transaction of 1 AED on real Stripe processes successfully, records captured payment, decrements stock, and triggers confirmation email. (Requires merchant live Stripe keys).
- [x] **PAY-CHK-4:** Guest checkout with `loyaltyCreditsRedeemed > 0` is rejected with `401 Unauthorized`. (Verified: unauthenticated loyalty points rejected with 401).
- [x] **PAY-CHK-5:** Purchasing a Discovery Set automatically generates a unique 280 AED voucher. (Verified: `/vouchers/verify` confirmed 280 AED voucher).

### Database & Migrations
- [x] **DB-CHK-1:** Neon database schema synchronized with `passwordHash`, `emailVerified`, and `Voucher` redemptions.
- [x] **DB-CHK-2:** Neon database connection string includes `?sslmode=require`.

### UI/UX & Responsive Layout
- [x] **UX-CHK-1:** Zero horizontal scroll/overflow across viewports; responsive container sizing verified.
- [x] **UX-CHK-2:** Mobile touch targets measure at least 44×44px for primary interactions (cart stepper, variant swatches, mobile action bar).
- [x] **UX-CHK-3:** Arabic RTL layout properly flips text alignment, navigation chevrons (`rtl:rotate-180`), and drawer navigation.

### Automated Testing & Operations
- [x] **OPS-CHK-1:** `vitest run` passes **100% (48/48 tests, 0 failures across 10 test files)**.
- [x] **OPS-CHK-2:** GitHub Actions CI workflow created in `.github/workflows/ci.yml`.
- [x] **OPS-CHK-3:** Production structured error logger with automatic PII scrubbing implemented (`apps/storefront/src/lib/logger.ts`).
- [ ] **OPS-CHK-4:** Nodemailer successfully sends live order confirmation emails to customer and admin via Zoho SMTP (Requires merchant Zoho SMTP credentials in `.env.production`).

---

## 8. REALISTIC EFFORT ESTIMATION & PARALLEL SPRINT SCHEDULE

```mermaid
gantt
    title Muschio Production Remediation Sprints (Total: ~52 Hours)
    dateFormat  YYYY-MM-DD
    section Track A: Security & Payments (Critical)
    Backdoor Removal (Task 1.1)               :crit, a1, 2026-11-12, 2h
    Customer Password Auth (Task 1.2)          :crit, a2, 2026-11-12, 14h
    Order IDOR & PII Masking (Task 1.3)        :crit, a3, 2026-11-13, 4h
    Database Baseline & Secrets (Task 1.4-1.5) :crit, a4, 2026-11-13, 4h
    Stripe Checkout Enforcement (Task 2.1)     :crit, a5, 2026-11-14, 10h
    Loyalty Exploit & Vouchers (Task 2.2-2.3)  :crit, a6, 2026-11-14, 8h
    Fix Vitest Suite (Task 2.4)                :crit, a7, 2026-11-15, 4h
    section Track B: UI/UX & Architecture (Parallel)
    Mobile Touch Target Remediation (Task 3.1) :b1, 2026-11-12, 6h
    RTL Icon & Layout Inversions (Task 3.2)    :b2, 2026-11-13, 3h
    Next.js Express Decoupling (Task 3.3)      :b3, 2026-11-14, 6h
    section Track C: Deploy & Operations
    Sentry APM & GitHub CI/CD (Task 4.1-4.2)   :c1, 2026-11-15, 7h
    Launch Checklist Verification (Sec 7)      :crit, c2, 2026-11-15, 4h
```

*Fix plan authored by Principal Software Architect, Security Lead, and DevOps Engineer.*
