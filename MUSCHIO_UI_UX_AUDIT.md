# MUSCHIO UI/UX AND CONVERSION AUDIT

**Date:** 2026-11-14
**Rating:** 6.8/10
**Scope:** live English storefront, Arabic route structure, responsive code, checkout/account/admin flows, accessibility semantics, and conversion trust.

## Executive assessment

Muschio looks premium and distinctive. Typography, spacing, restrained color, product imagery, house/note discovery, bilingual routing, and the revised About/Contact pages create a credible luxury surface. Conversion is weakened by too many unverified claims, stale product URLs, missing legal/trust infrastructure, limited genuine reviews, invalid product-card interaction nesting, and a crowded header/footer. The visual system is ahead of the operational proof.

## Page-by-page findings

### Homepage

**Strengths**

- Strong luxury hierarchy and recognizable brand voice.
- Clear entry points to shop, houses, notes, discovery sets, AI recommendations, and journal.
- Product cards expose price, variant range, badges, imagery, wishlist, and carousel controls.
- House section is now structured as a horizontal editorial list with consistent card heights.

**Conversion blockers**

- Live product names and URLs disagree, including `/product/test` and stale renamed-product slugs.
- Product card wraps wishlist/image navigation buttons inside the product link (`product-card.tsx:326-405`), creating invalid nested interaction semantics and accidental navigation risk.
- “Official,” “authorized,” “100% authentic,” climate-controlled, free return, customs-cleared, and same-day claims lack visible proof/terms.
- Homepage has many successive sections and repeated high-luxury language; the primary purchase path loses emphasis.
- Promotion language competes with exclusive positioning and may feel perpetual.

### Header/navigation/search

**Strengths:** keyboard-labeled icon controls, skip link, bilingual switch, account/orders/tracking access, structured mega navigation.
**Issues:** high action density; several concepts compete above the fold; desktop mega-menu copy is verbose; header contains a raw `<img>` flagged by Next lint; mobile cognitive load should be validated in moderated testing.

### Shop/catalog

**Strengths:** server-loaded catalog, search, filters, sorting, tags, variants, prices, stock-aware cards.
**Issues:** metadata/canonical is wrong; filters lack clean shareable/indexable category routes; server query caps at 100 without pagination strategy; no visible result rationale or filter summary was verified; discount-field anomalies need normalization.

### Product detail

**Strengths:** size variants, scent notes, concentration, price comparison, related products, stock and purchase controls.
**Issues:** no unique metadata; schema can invent ratings/availability/shipping; product provenance is asserted rather than demonstrated; verified review volume is minimal; returns eligibility and delivery estimate should be contextual to selected variant/destination.

### Brand and note pages

**Strengths:** useful education and internal discovery.
**Issues:** brand page labels every brand “Authorized Stockist” without a documented condition; no unique metadata; brand imagery is incomplete (six of 14 brands lack hero images); origin/heritage copy needs editorial sourcing.

### Cart and checkout

**Strengths:** server totals, promotion evaluation, inventory reservation, idempotency, Stripe hosted checkout, COD, and error states.
**Issues:** no frontend E2E evidence; payment badges/content mention Tabby/Tamara although current payment service exposes card wallets/COD only; delivery and returns statements need precise terms; checkout should show a final line-by-line server quote before redirect.

### Account, orders, tracking, returns

**Strengths:** password auth, order history, guest lookup, tracking timeline, cancellation/return workflows, masked responses.
**Issues:** order lookup uses reusable identifiers rather than OTP; user trust would improve with clear lookup privacy text; returns policy is dispersed rather than a dedicated decision page; admin/browser storage risks affect back-office privacy.

### About and Contact

**Strengths:** revised pages are cleaner, responsive, bilingual, more scannable, and use restrained reveal animation with reduced-motion support. Contact topics and order-reference behavior are task-oriented.
**Issues:** business legal name, registration, verifiable address, response SLA, and operational hours are not established. Contact details must be confirmed as real.

### Footer and legal trust

**Critical gap:** no direct privacy, terms, cookie, or dedicated returns/refund policy links. `/privacy` and `/terms` redirect to missing guide fragments. This is both a conversion and legal-readiness blocker.

### Admin UX

**Strengths:** broad product/variant/SKU, brand, note, order, returns, review, content, promotion, loyalty, settings, and audit capabilities.
**Issues:** `App.tsx` is 7,448 lines; the production JS bundle is 1,026.77 kB minified; state and PII are cached in localStorage; polling occurs every 4.5 seconds; complex roles are not reflected in proxy permissions; operational mistakes are harder to prevent in a monolith.

## Accessibility findings

| ID | Priority | Finding | Evidence / impact | Acceptance criteria |
|---|---|---|---|---|
| UX-001 | P1 | Interactive buttons nested in a link | `product-card.tsx:326-405`; invalid interaction model for keyboard/screen readers. | Card link and action buttons are siblings; all actions work with keyboard and do not navigate unexpectedly. |
| UX-002 | P2 | Hover-only carousel arrows | Controls use `opacity-0 group-hover:opacity-100`; keyboard visibility requires explicit focus styles/state. | Arrows appear on focus-within and have visible focus. |
| UX-003 | P2 | Automated accessibility suite absent | No axe/Playwright tests found. | WCAG 2.2 AA test suite covers homepage, shop, PDP, cart, checkout, account, contact, Arabic RTL. |
| UX-004 | P2 | Claims and status text may overwhelm screen-reader link names | Live product link names include wishlist, carousel, all image alts, product and price. | Product link has a concise name; controls have independent names. |
| UX-005 | P3 | Color/contrast not independently measured | Visual review only. | Automated contrast plus manual dark/light/RTL review passes. |

Positive accessibility evidence includes a skip link, semantic headings, labeled navigation, `lang`/`dir`, 44px carousel targets, form labels/status regions, and reduced-motion handling on editorial pages.

## Top 10 conversion improvements

1. Publish a verified trust/legal center linked globally.
2. Replace unsupported claims with evidence: supplier provenance, return terms, delivery service, and business identity.
3. Correct product slugs and metadata before paid acquisition.
4. Separate product-card links and action buttons.
5. Show exact delivery estimate and return eligibility near the selected variant.
6. Display only genuine verified reviews and explain verification.
7. Align payment messaging to methods actually available at checkout.
8. Simplify the header’s top-level actions, especially on mobile.
9. Add clear gift services and discovery voucher terms.
10. Add end-to-end tests and session replay/analytics only after compliant consent.

## Animation guidance

- Keep reveal motion under 500ms, transform/opacity only, and never delay content availability.
- Respect `prefers-reduced-motion` everywhere, not only About/Contact.
- Use motion to explain state changes: cart confirmation, filter application, payment transition, tracking progress.
- Avoid continuous decorative movement in luxury product browsing.
- Measure INP and CLS before expanding animation.

## Required validation

- Desktop: 1440×900 and 1280×800.
- Tablet: 768×1024.
- Mobile: 390×844 and 360×800.
- English and Arabic RTL.
- Keyboard-only and screen-reader smoke tests.
- 200% zoom/reflow.
- Dark/light themes.
- Empty, loading, error, out-of-stock, invalid coupon, failed payment, and expired session states.
- Moderated tests with UAE fragrance shoppers for trust comprehension and discovery-to-PDP flow.
