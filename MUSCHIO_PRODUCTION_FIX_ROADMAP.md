# MUSCHIO PRODUCTION FIX ROADMAP

**Date:** 2026-11-14
**Current release decision:** NO-GO
**Rule:** Close and verify every P0 before growth launch or broader admin access.

## Prioritized backlog

| ID | Priority | Owner | Fix | Effort | Dependencies | Acceptance criteria |
|---|---|---|---|---:|---|---|
| SEC-001 | P0 | Platform | Upgrade Next.js past all cited advisories; upgrade/replace SheetJS and vulnerable transitive packages. | 3-8d | Regression suite | No critical/high reachable production advisory; build/test/E2E pass. |
| SEC-002 | P0 | Backend | Add explicit RBAC matrix to Next proxy or remove duplicated proxy operations in favor of Express API. | 3-5d | Role fixtures | Every admin method has positive/negative role tests and returns 403 correctly. |
| DB-001 | P0 | DBA/Backend | Reconcile Prisma migration history on isolated Neon branch; validate clean bootstrap/deploy/restore. | 1-3d | Backup/branch | `migrate status` clean; deploy and rollback rehearsed. |
| SEO-001 | P0 | SEO/Frontend | Add unique metadata, self-canonical, OG, and hreflang to every commercial/content route. | 4-7d | Metadata fields | Automated crawl asserts unique metadata on every sitemap URL. |
| SEO-002 | P0 | SEO/Backend | Remove invented schema defaults; emit only verified database/settings facts. | 2-4d | Business evidence | Rich Results Test passes and rendered values match visible/database content. |
| TRUST-001 | P0 | Legal/Product | Publish privacy, terms, cookies, returns/refunds, shipping, and business identity pages. | 5-10d | UAE counsel | Counsel-approved, linked globally, versioned, bilingual, and operationally accurate. |
| TRUST-002 | P0 | Operations/Marketing | Verify or remove authorization, provenance, delivery, customs, returns, BNPL, physical-location, phone, and social claims. | 3-7d | Supplier/logistics proof | Every claim has an owner, source, effective date, and customer-facing terms. |
| SEC-003 | P1 | Platform | Move admin session to HttpOnly cookies and remove PII/order records from web storage. | 4-7d | Session API | Storage inspection shows no tokens/PII; logout/revocation tests pass. |
| CAT-001 | P1 | Catalog/SEO | Correct stale product slugs and create one-hop 301 redirects. | 2-4d | Slug map | Name/H1/title/canonical/schema/slug align for all products. |
| CAT-002 | P1 | Merchandising | Resolve 15 discount anomalies; complete two note mappings and four Arabic descriptions. | 2-3d | Content review | Catalog aggregate checks return zero defects. |
| UX-001 | P1 | Frontend | Remove nested buttons from product-card links. | 1-2d | Accessibility QA | Keyboard, screen reader, and pointer tests pass. |
| PERF-001 | P1 | Frontend | Replace global force-dynamic/no-store with route-level cache/revalidation and catalog update tags. | 3-6d | Cache invalidation | Public pages cache safely; admin updates revalidate within SLA. |
| QA-001 | P1 | QA | Add Playwright E2E for auth, catalog, variant sync, cart, checkout, payment return, tracking, returns, admin RBAC, RTL. | 8-15d | Test environment | Critical paths pass in CI on every release. |
| TRUST-003 | P1 | Product | Implement OTP/signed-link order lookup and clear privacy guidance. | 2-4d | Email/SMS | Order details require short-lived proof; abuse throttles tested. |
| SEO-003 | P1 | SEO/Frontend | Build clean inventory-backed categories for niche, unisex, oud, gifts, discovery, and suitable gender segments. | 5-10d | Inventory depth | Unique category content/metadata, no empty pages, clean canonicals. |
| PERF-002 | P2 | Admin | Split 7,448-line admin app and lazy-load modules; replace 4.5s global polling with scoped refresh/realtime. | 10-20d | Architecture plan | Initial admin JS <400 kB minified target; polling/network load reduced. |
| OPS-001 | P2 | Platform | Add error monitoring, security alerts, payment/webhook dashboards, and on-call runbooks. | 4-8d | Monitoring vendor | Alerts tested for checkout, payment, email, migration, auth, and 5xx spikes. |
| SEO-004 | P2 | SEO | Remove query-string sitemap URLs; correct lastModified and regional hreflang. | 1-2d | Clean categories | Sitemap contains only canonical 200 URLs with accurate update dates. |
| PERF-003 | P3 | Frontend | Replace remaining raw header `<img>` with optimized image handling. | <1d | Image asset | Lint warning removed; no layout shift. |

## Release gates

### Security gate

- Dependency audit has no unresolved critical/high reachable vulnerabilities.
- Proxy and API RBAC matrix passes.
- Admin token is not script-readable.
- CSP is enforced after report-only validation.
- Independent penetration-test P0/P1 findings are closed.

### Commerce gate

- Server totals, promotions, loyalty, shipping, inventory, Stripe/COD, and refunds pass E2E.
- Stripe test-mode success, failure, async, expiry, and duplicate webhook cases reconcile exactly once.
- All customer-facing payment/delivery/returns claims match active capability.

### SEO/trust gate

- Every indexable URL has unique metadata, self-canonical, hreflang, and valid schema.
- Legal policies are counsel-reviewed, bilingual, visible, and operational.
- Unsupported business/authorization/social/address claims are removed.
- Search Console sitemap/index coverage is clean enough for launch sign-off.

### Operations gate

- Migration deploy/restore is rehearsed on an isolated production-like branch.
- Monitoring alerts and runbooks are tested.
- Customer support channels and response SLAs are staffed.
- Catalog defect aggregate returns zero critical defects.

## 30/60/90-day sequence

### Days 0-30 — risk containment

1. SEC-001, SEC-002, DB-001.
2. SEO-001, SEO-002.
3. TRUST-001, TRUST-002.
4. SEC-003 and basic CSP.
5. CAT-001 and UX-001.

### Days 31-60 — conversion and reliability

1. QA-001 critical-path E2E.
2. PERF-001 caching and revalidation.
3. CAT-002 catalog cleanup.
4. TRUST-003 secure lookup.
5. SEO-003 category landing pages and sitemap cleanup.

### Days 61-90 — measured growth

1. Search Console/GA4 with consent management.
2. Genuine review acquisition after verified delivery.
3. Evidence-led editorial and gifting content.
4. Admin modularization/performance.
5. Independent pentest, recovery drill, and re-audit.

## Ordered fixes required to become highly competitive

1. Patch critical dependencies.
2. Enforce admin roles at every production entry point.
3. Repair migration history.
4. Fix product/category canonicals and metadata.
5. Remove fabricated schema and claims.
6. Publish real legal/trust policies.
7. Correct product slugs and catalog discount data.
8. Protect admin sessions and customer data.
9. Add complete checkout/RBAC/RTL E2E coverage.
10. Cache public pages safely and reduce admin bundle/network load.
11. Establish verified review/provenance programs.
12. Launch clean inventory-backed SEO categories.
13. Connect measurement and monitor field CWV/indexing/conversion.
14. Complete independent security and disaster-recovery sign-off.
