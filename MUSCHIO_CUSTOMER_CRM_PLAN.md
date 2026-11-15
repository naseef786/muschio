# Muschio Customer CRM Implementation Plan

Date: 2026-11-15
Status: Proposed; implementation and deployment have not started.
Goal: Give support staff one clear place to find a customer, understand their orders, and follow up without altering commerce history.

## 1. Evidence and scope

Reviewed local code, not production customer records:

- [Admin navigation](apps/admin/src/App.tsx): Orders, Messages & Inquiries, and Promotions & Rewards exist; no Customers workspace.
- [Customer schema](apps/api/prisma/schema.prisma): Customer, Address, FragranceProfile, orders, returns, loyalty transactions, admin roles, and audit logs already exist.
- [Customer service](apps/api/src/services/customer.service.ts): account/profile/address operations exist, but they are not an admin CRM. Passwordless customer records can be upgraded during registration; verify ownership protection before exposing linked historical guest data to a new account.
- [Admin role policy](apps/storefront/src/lib/admin-rbac.ts): customer resources need an explicit policy. Unknown admin resources currently default to super-admin access.
- [Loyalty UI](apps/admin/src/components/MarketingPromotionsTab.tsx): email lookup references `/admin/customers/search`; verify and implement its contract as part of CRM, rather than adding another incompatible lookup.
- [Production roadmap](MUSCHIO_PRODUCTION_FIX_ROADMAP.md): migration history and admin authorization have recorded work. Reverify those items; the document alone is not proof of present deployment status.

Assumption: build an integrated ecommerce CRM in the existing admin, not a separate CRM product or a sales-deal pipeline. Preserve existing auth, Prisma, payment services, and loyalty ledger.

## 2. Admin experience

Add **Customers** directly after Orders. Use a dedicated lazy-loaded module, not another large inline section in the admin root.

### Customer directory

- Search name, email, phone, or order number on the server.
- Filters: registered accounts, guest buyers, VIP, purchase history, country, and last purchase date. Add tags/segments when their supporting phase ships.
- Columns: name, contact, account type, paid orders, net paid amount, last purchase, VIP status.
- Explicit Unknown/Unavailable states; no fabricated names, amounts, or dates.
- Pagination, sort, result count, clear filters, loading, retry, empty results, and permission-denied states.
- Distinguish a valid empty list from a failed request. Do not fall back to localStorage customer data.

### Customer profile

Full page with a persistent URL and tabs: Overview, Orders & Returns, Addresses, Loyalty, Preferences, then Notes & Activity and Follow-ups as those phases ship.

- Header: customer name, account/guest label, verified status where supported, VIP, contact details, and permitted actions.
- Overview: paid orders, gross captured amount, refunds, net paid amount, last paid order, and open support work.
- Orders: separate payment and fulfillment statuses; link to existing order details and returns.
- Addresses: saved addresses are distinct from historical order shipping snapshots. Profile changes must not rewrite past orders.
- Loyalty: balance and ledger from the existing service; adjustments require the existing authorized workflow and a reason.
- Preferences: existing fragrance families and notes, displayed as customer-provided preferences rather than inferred facts.
- Profile updates: permitted names/phone fields first; email changes require an identity-verification design. No password viewing, direct password setting, or customer impersonation.

### Mobile and accessibility

At 360px, use stacked customer cards and wrapped contact information; no clipped prices or page-wide horizontal scrolling. Keep comfortable text sizes and 44px action targets. Preserve keyboard focus, semantic labels, readable contrast, Arabic UTF-8, and RTL where the admin supports localization. Filters and pagination survive Back navigation.

## 3. Delivery sequence

Estimates are engineering working days, not a delivery commitment. They assume one experienced full-stack developer with QA support and an available isolated test environment; identity or migration remediation can extend them.

| Phase | Deliverable | Estimate | Exit criteria |
| --- | --- | --- | --- |
| 0: Data and access contract | Confirm guest/account identity, spend/refund mapping, route permissions, enquiry storage, and migration readiness | 1-2 days | Fixtures and definitions agreed; security dependencies identified; no reset/backfill |
| 1: Customer workspace | Customers navigation, search/filter/pagination, profiles, order/return/address links, read-only loyalty, guest purchase visibility | 4-6 days | Authorized staff find customers and reconcile displayed data; both API entry points pass role tests |
| 2: Daily support tools | Audited basic profile editing, VIP/tags, internal notes, activity history, assigned follow-up tasks, links to enquiries | 3-5 days | Changes persist with actor/time; conflicts handled; notes remain internal; task lifecycle works |
| 3: Segments and controlled exports | Saved customer groups, retention views, permissioned CSV export, marketing preference records | 3-5 days | Segment results match definitions; export reflects filters and access; unsubscribe suppression tested |
| 4: Optional communication automation | Approved email/WhatsApp integrations, templates, delivery logs, retries and suppression | Separately scoped | Provider setup and consent prerequisites complete; duplicate sends prevented; kill switch verified |

Useful first release: phases 0-1, approximately 5-8 working days. Core operational CRM: phases 0-2, approximately 8-13 working days. Do not delay customer search/profile delivery for marketing automation.

## 4. Identity and commerce rules

1. Use Customer.id for registered/customer-linked records. Guest purchases with no customerId remain explicitly guest records, keyed by order ID in the first release; searching their contact details must not create accounts.
2. Do not merge records or grant storefront order access based only on matching names, typed email addresses, or shared phone numbers. Matching contact details may suggest related records for staff review, not establish ownership.
3. Passwordless customer rows are not automatically verified registered accounts. Review the existing registration upgrade path before changing guest-to-account association. Account claiming must require proof of contact ownership.
4. Do not automatically create accounts from contact submissions. Keep enquiries linked only through an explicit, validated association; retain unlinked enquiries.
5. Define paid-order count as distinct orders with confirmed captured/collected payment. Pending/failed attempts and uncollected COD do not count. Show fully refunded orders distinctly.
6. Net paid amount = verified captured/collected amount minus confirmed refunds, grouped by currency. Do not infer payment from a fulfillment status or count webhook/payment retries twice.
7. Validate actual refund/COD records first. If reliable refund amounts are unavailable, show a labeled captured total and refund-unavailable state; do not present it as net lifetime spend.
8. Calculate money on the server with established Decimal conventions and serialize explicit DTO fields. Missing monetary data stays unavailable, not zero. Never send raw Prisma records or payment-event payloads to the browser.
9. New CRM edits cannot directly change payment status, refund money, amend order totals, or mutate loyalty balances. Link to existing authorized workflows.
10. No database reset, automatic merge, bulk deletion, or historical order rewrite is part of this plan.

## 5. Architecture and contracts

- A customer-admin service owns queries, filtering, aggregation, and permitted mutations.
- Express and the storefront Next.js API adapter call that same service. Both entry points enforce the same explicit role policy and shared Zod request/response contracts.
- Add a small typed CRM API client and separate directory/profile components. Fetch only the active tab; do not add global customer polling.
- Prefer explicit field selection, bounded page sizes, stable sort with an ID tie-breaker, debounced search, and cancellation of stale requests.
- Add indexes based on verified query patterns. Avoid per-row order queries and unbounded relation loading.
- Use UTC timestamps, display in the configured admin timezone, and expose when totals were last refreshed.
- Invalidate affected directory/profile queries after edits; include a manual refresh and refetch on focus for external order updates.

Proposed endpoints, not existing capabilities:

| Endpoint | Purpose |
| --- | --- |
| GET `/api/v1/admin/customers` | Paginated directory with validated filters and server summaries |
| GET `/api/v1/admin/customers/search` | Bounded exact-email lookup compatible with the loyalty UI |
| GET `/api/v1/admin/customers/:id` | Explicit customer summary DTO |
| GET `/api/v1/admin/customers/:id/orders` | Paginated purchase and return references |
| GET `/api/v1/admin/customers/:id/addresses` | Permitted saved addresses |
| GET `/api/v1/admin/customers/:id/loyalty` | Balance and paginated transaction view |
| GET `/api/v1/admin/customer-guests` | Guest purchase directory without creating customer identities |
| PATCH `/api/v1/admin/customers/:id` | Allowlisted fields with revision/conflict check |
| GET/POST `/api/v1/admin/customers/:id/notes` | Internal notes with author and timestamps |
| GET/POST `/api/v1/admin/customers/:id/tasks` | Assigned follow-ups; status updates use a task-specific endpoint |
| GET `/api/v1/admin/customers/:id/activity` | Paginated business activity assembled from existing source records and CRM events |

Define tags, segments, consent, and export routes when their phase is implemented; do not expose nonfunctional buttons early. Static paths such as `/search` must not be captured by `/:id` routes.

## 6. Data additions, only when needed

Phase 1 should reuse existing relations and avoid schema changes where practical. Later phases add:

- CustomerNote: customer, text, author, timestamps; audited edits/redactions.
- CustomerTag and assignment table: unique tag keys and unique customer/tag pairs.
- CustomerTask: customer, title, assignee, due date, priority, status, completion actor/time.
- ConsentEvent: customer/contact reference, channel, purpose, granted/withdrawn state, source, evidence reference, policy version, timestamp. Unknown consent is not granted consent.
- SavedCustomerSegment: validated filter definition, name, owner, timestamps; version filter definitions.
- Explicit customer-enquiry linking if current storage has no reliable relationship.

Reuse AuditLog for administrative mutations and existing order/loyalty/business events for the timeline; do not copy the full customer/order database into a second activity store. Audit details are allowlisted and avoid secrets or excessive personal data.

## 7. Access and customer-data handling

Initial mapping using existing roles:

| Action | SUPER_ADMIN | ORDER_MANAGER | Other existing roles |
| --- | --- | --- | --- |
| Customer/order/profile read for support | Yes | Yes | No |
| Basic contact edits, notes, tasks | Yes | Yes, allowlisted fields | No |
| VIP/tag management | Yes | Limited to agreed support tags | No |
| Loyalty adjustment | Existing authorized workflow | No new permission | No |
| Bulk export, identity merge, privacy administration | Separate privileged workflows | No | No |

Use least privilege and validate authorization on every request, including direct URL/API access, following [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). Hiding a menu is not authorization.

- Never return password hashes, session tokens, unrestricted payment payloads, or internal notes in storefront APIs.
- No CRM customer records in localStorage or shared/public response caches. Clear cached queries on logout or admin identity change.
- Export needs its own permission, audit event, bounded scope, safe CSV escaping, and spreadsheet-formula neutralization. File generation must recheck authorization.
- Marketing preferences are separate from transactional support communication. Signup or a contact enquiry is not automatically marketing opt-in.
- Record withdrawals and apply suppression before each automated send. Keep external messaging disabled until its phase is configured and authorized.
- Define retention, correction, export and anonymization workflows with the business; do not implement blanket hard-delete of customers with financial history.

## 8. Test and release gates

Before each release:

1. API integration tests: list/detail contracts, search normalization, pagination boundaries, filters, stale edits, and malformed input.
2. Role matrix tests against Express and Next adapters: unauthenticated 401, unauthorized 403, authorized access, and no public leakage of notes/PII.
3. Money fixtures: unpaid, paid, failed, COD-uncollected, COD-collected, partial/full refunds, duplicate callbacks and missing data. Assert server totals and UI labels agree.
4. Identity fixtures: registered customer, passwordless record, guest-only order, shared phone, duplicate/case-varied email, unlinked enquiry, and no unintended account/order reassignment.
5. Browser flows: find customer, open profile, follow order link, go Back, refresh, session expiry, retry error, and permitted note/task updates.
6. Mobile/keyboard review at 360px, tablet and desktop; long names/emails, missing images, empty states, loading, and large histories.
7. Performance target: directory query p95 below 500ms on representative warmed test data; measure network and database cold-start separately. Establish a dataset size before treating this target as achieved.
8. Required typecheck/test/build gates pass; provide concrete local demonstration and a release summary.

## 9. Migration and rollout

Following the Neon/Postgres skill, preserve Prisma and rehearse additive migrations in an isolated environment. [Neon database branches](https://neon.com/docs/introduction/branching) support isolated testing. Start with synthetic customer fixtures; production-like data requires an approved environment and appropriate masking.

- Verify migration history before adding schema. Use a direct database connection for migration tooling; keep application pooling unchanged.
- No production schema or data mutation during planning/local development. Localhost alone does not mean the configured database is isolated.
- Deploy behind a customer-CRM feature flag. Apply compatible additive schema before enabling dependent code.
- Pilot with SUPER_ADMIN, then ORDER_MANAGER after permission tests and staff review.
- Monitor API errors/latency, unauthorized access, failed mutations, and query volume without logging customer payloads.
- Rollback: disable the feature flag and roll back application code; retain additive tables and audit records. Do not drop customer data as rollback.
- Git push, production migration, deployment, and any external-service activation remain separate explicit approvals under repository governance.

## 10. First implementation batch

1. Finalize identity and monetary definitions with fixtures.
2. Implement shared read-only customer service, contracts and role tests.
3. Add Customers navigation, paginated directory and profile pages.
4. Connect orders/returns, addresses, fragrance preferences and read-only loyalty.
5. Verify both admin entry points locally and present the working first release before production approval.

Deferred deliberately: customer merging, CSV imports, automated campaigns, WhatsApp integration, AI profiling, sales pipelines, and destructive deletion tools.
