# MUSCHIO — PROMOTIONS, LOYALTY & ADMIN CONTROL AUDIT REPORT

**Date:** November 11, 2026  
**Auditor:** Principal Full-Stack & DevSecOps Systems Architect, E-Commerce Promotion Specialist  
**Application:** Muschio Luxury Fragrance E-Commerce Platform (UAE & GCC)  
**Status:** COMPLETE AUDIT — IMPLEMENTATION REQUIRED  

---

## 1. Executive Summary & Non-Negotiable Core Principle

A comprehensive code-level audit was conducted across the entire Muschio application repository, encompassing the storefront Next.js application, Express API service, Prisma PostgreSQL database schema, Admin React panel, shared packages, email/WhatsApp notification pipelines, and checkout business logic.

### The Non-Negotiable Principle
> **The Muschio storefront must NEVER independently define, activate, calculate, or advertise hardcoded promotional benefits.**
> All customer-facing promotions, loyalty benefits, discount codes, vouchers, gift cards, offers, and reward configurations must be controlled by authorized administrators through the backend and admin panel. The backend must always validate eligibility and calculate the final benefit.

### Key Audit Findings
1. **Zero Admin Control for Promotions & Loyalty:** The Admin Panel (`apps/admin/src/App.tsx`) has tabs for Orders, Products, Inventory, Collections, Brands, Notes, Tags, Purchasing, Returns, Enquiries, Reviews, Markets, Banners, Settings, and Audit, but **NO Marketing, Promotion, Coupon, Voucher, Gift Card, or Loyalty management interface**.
2. **Hardcoded Financial Ratios in Code:** 
   - Loyalty earning rate (1 point per 1 AED) is hardcoded in `apps/api/src/services/checkout.service.ts`.
   - Loyalty redemption rate (10 points = 1 AED) is hardcoded in `apps/api/src/services/customer.service.ts` and `checkout.service.ts`.
   - Discovery set voucher discount (280 AED, 60 days validity) is hardcoded in `checkout.service.ts` and multiple storefront pages.
   - Loyalty membership tiers (Privilege <1000, Gold Sillage 1000-2999, Royal Ambassador 3000+) are hardcoded in `customer.service.ts`.
3. **Deceptive / Simulated Storefront Loyalty Claims:** 
   - In `apps/storefront/src/app/[locale]/account/page.tsx`, the loyalty tier progress bar hardcodes `"1,450 / 3,000 Points"` and `"Accumulate 1,550 more points to upgrade to Royal Ambassador Tier"` regardless of actual user points.
   - The registration form claims `"Join Muschio Privilege (+100 Welcome Points)"`, but the backend awards 0 points on registration.
4. **Premature Point Awards:** Loyalty points are awarded immediately upon order placement in `checkout.service.ts`, before payment authorization or capture, and are never reversed upon return, cancellation, or refund.
5. **No Transaction Ledger:** Points are modified via bare `decrement` and `increment` on `Customer.loyaltyPoints` without an immutable transaction ledger, meaning customer balances cannot be audited or reconciled.
6. **Hardcoded Fallbacks:** If an offer banner is missing from the database, the homepage falls back to a hardcoded promotional deal banner (`DEFAULT_OFFER_BANNER`). If a voucher discount amount is null, the API and checkout fall back to 280 AED.

---

## 2. Comprehensive Inventory of Findings

| ID | Feature / Rule | File & Line | Current Behavior | Type | Admin Control | Backend Validation | Risk Level | Recommendation | Classification |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **AUD-001** | Discovery Set Voucher Issuance | `apps/api/src/services/checkout.service.ts:354-367` | Issues 280 AED voucher valid for 60 days on discovery set checkout | Hardcoded | ❌ None | ⚠️ Static code | **HIGH** | Configurable via Promotion Engine rule | **REFACTOR** |
| **AUD-002** | Discovery Set Storefront Copy | `apps/storefront/src/app/[locale]/discover/sets/page.tsx:120,284,499`, `guide/page.tsx:313` | Hardcoded "280 AED digital voucher valid for 60 days" | Hardcoded text | ❌ None | ❌ None | **MEDIUM** | Dynamic copy from active Promotion Campaign | **REPLACE** |
| **AUD-003** | Loyalty Point Earning Ratio | `apps/api/src/services/checkout.service.ts:407-415` | Awards 1 point per 1 AED spent immediately on order creation | Hardcoded | ❌ None | ⚠️ Static code | **CRITICAL** | Points awarded on payment capture via ledger | **REFACTOR** |
| **AUD-004** | Loyalty Redemption Rate | `apps/api/src/services/customer.service.ts:22-23`, `checkout.service.ts:172` | `Math.floor(points / 10)` = 1 AED discount | Hardcoded | ❌ None | ⚠️ Static code | **HIGH** | Configurable `LoyaltyProgramConfig` table in DB | **REFACTOR** |
| **AUD-005** | Loyalty Membership Tiers | `apps/api/src/services/customer.service.ts:13-17` | Tiers hardcoded: <1000 PRIVILEGE, 1000-2999 GOLD_SILLAGE, 3000+ ROYAL_AMBASSADOR | Hardcoded | ❌ None | ⚠️ Static code | **MEDIUM** | Database `LoyaltyTier` table with admin CRUD | **REFACTOR** |
| **AUD-006** | Simulated Checkout Loyalty Rates | `apps/storefront/src/app/[locale]/checkout/page.tsx:161-163` | Client computes `isGoldSillage ? 0.08 : 0.05` | Frontend calc | ❌ None | ❌ Frontend | **HIGH** | Fetch points from `/api/v1/promotions/quote` | **REPLACE** |
| **AUD-007** | Deceptive Tier Progress Bar | `apps/storefront/src/app/[locale]/account/page.tsx:303,313` | Hardcoded string "1,450 / 3,000 Points" and "1,550 more points" | Hardcoded text | ❌ None | ❌ None | **HIGH** | Compute dynamic progress from user points & DB tiers | **REPLACE** |
| **AUD-008** | Unfulfilled Welcome Bonus | `apps/storefront/src/app/[locale]/account/page.tsx:487` | Advertises "+100 Welcome Points" on signup; backend awards 0 | Hardcoded text | ❌ None | ❌ Backend awards 0 | **HIGH** | Configurable welcome points in loyalty config | **REFACTOR** |
| **AUD-009** | Hardcoded Offer Banner Fallback | `apps/storefront/src/app/[locale]/page.tsx:35-45,198` | Renders `DEFAULT_OFFER_BANNER` if no banner active | Hardcoded fallback | ❌ None | ❌ None | **MEDIUM** | If no active campaign, show clean UI | **REPLACE** |
| **AUD-010** | Hardcoded Free Shipping Limit | `apps/storefront/src/components/header.tsx:1174`, `apps/api/src/services/checkout.service.ts:114` | Cart drawer & delivery hardcode 500 AED limit | Hardcoded | ❌ None | ⚠️ Static 500 | **MEDIUM** | Dynamic rule from Promotion Engine / Delivery | **REFACTOR** |
| **AUD-011** | Basic Voucher Model Missing Rules | `apps/api/src/services/checkout.service.ts:200-230` | Lacks min order, max cap, customer usage limit, brand/product rules | Schema limitation | ❌ None | ⚠️ Basic check | **CRITICAL** | Full `Promotion` & `Coupon` schema engine | **REFACTOR** |
| **AUD-012** | Missing Admin Marketing Section | `apps/admin/src/App.tsx:3004-3019` | No admin UI for coupons, promotions, vouchers, gift cards, loyalty | Missing feature | ❌ Missing | ❌ Missing | **CRITICAL** | Build "Marketing & Rewards" in Admin Panel | **ADD** |
| **AUD-013** | Missing Loyalty Ledger | `apps/api/prisma/schema.prisma:728` | Direct balance mutations on `Customer.loyaltyPoints` without history | Schema limitation | ❌ None | ❌ None | **CRITICAL** | `LoyaltyTransaction` immutable ledger | **ADD** |
| **AUD-014** | Absence of Gift Card Support | Entire repository | Mentioned in store copy; zero backend models or balance tracking | Missing feature | ❌ Missing | ❌ Missing | **HIGH** | `GiftCard` model, issuance & partial redemptions | **ADD** |
| **AUD-015** | Dangerous 280 AED Voucher Default | `route.ts:630`, `checkout/page.tsx:1370` | `discountAmount: Number(data.data.discountAmount \|\| 280)` | Dangerous fallback | ❌ None | ❌ Fallback | **CRITICAL** | Strict backend calculation, remove fallback | **REPLACE** |

---

## 3. Deep-Dive Analysis by Domain

### 3.1 Loyalty & Rewards Architecture
The current implementation in `CustomerService` and `CheckoutService`:
- Represents customer loyalty solely as an integer field `Customer.loyaltyPoints`.
- Directly increments points in `processCheckout` (`loyaltyPoints: { increment: pointsEarned }`) when an order is created.
- Fails to track whether the payment was captured or abandoned.
- Fails to reverse points when orders are returned, cancelled, or refunded in `ReturnsService`.
- Lacks a transaction ledger, making balance disputes impossible to resolve.
- Hardcodes the redemption rate to 10 points = 1 AED in multiple places without admin controls.

### 3.2 Promotions & Coupons Engine
The current implementation in `Voucher` and `CheckoutService`:
- Vouchers only contain `code`, `discountPercent`, `discountAmount`, `currency`, `isDiscoveryVoucher`, and `expiresAt`.
- Lacks `startsAt` for scheduled campaigns.
- Lacks `minOrderAmount`, `maxDiscountAmount`, `customerUsageLimit`, `totalUsageLimit`, and `usageCount`.
- Lacks target restrictions (`applicableProductIds`, `applicableBrandIds`, `applicableCategoryIds`, `customerSegment`).
- Lacks automatic promotions (BOGO, seasonal sales, tiered spending discounts, free gifts).

### 3.3 Gift Card System
- Currently zero backend infrastructure for gift cards.
- Gift cards require dedicated models: unique secure codes, recipient email/name, initial balance, remaining balance, partial redemption tracking, expiration rules, and admin issuance with audit logging.

### 3.4 Storefront Compliance
- Storefront components frequently make assumptions about promotional amounts (e.g. 280 AED vouchers, 500 AED free delivery, 5% vs 8% loyalty rates).
- Hardcoded fallback banners violate the principle of showing a clean, non-promotional interface when no admin campaign is scheduled.

---

## 4. Remediation Plan & Architecture Roadmap

1. **Schema Expansion:**
   - Add `Promotion`, `PromotionRule`, `Coupon`, `CouponRedemption` models.
   - Add `LoyaltyProgramConfig`, `LoyaltyTier`, `LoyaltyTransaction` models.
   - Add `GiftCard`, `GiftCardTransaction` models.
2. **Centralized Promotion Engine (`apps/api/src/services/promotion.service.ts`):**
   - Single point of truth for validating coupons, calculating automatic promotions, evaluating cart eligibility, enforcing usage limits, and returning authoritative discount breakdowns.
3. **Loyalty Ledger Service (`apps/api/src/services/loyalty.service.ts`):**
   - Immutable point ledger tracking EARNED, REDEEMED, REFUNDED, EXPIRED, and MANUAL_ADJUSTMENT.
   - Points awarded strictly on `PAYMENT_CAPTURED` or verified completed orders.
   - Point reversals on refunds and returns.
4. **Admin Panel "Marketing & Rewards":**
   - Promotions Dashboard with real financial KPIs.
   - Coupon Management (creation, usage limits, restrictions, scheduling).
   - Voucher Management (issuance, liability reporting).
   - Gift Card Management (issuance, balance inspection).
   - Offer & Campaign Management (banners, placements, bilingual copy).
   - Loyalty Program Configuration & Customer Ledger Adjustments.
5. **Storefront Decoupling:**
   - Replace client-side calculations with `/api/v1/promotions/quote`.
   - Remove hardcoded fallbacks and fake loyalty tier numbers.
   - Bind discovery set vouchers to database-driven promotion rules.

