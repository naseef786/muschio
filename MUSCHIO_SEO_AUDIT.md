# MUSCHIO TECHNICAL SEO AUDIT

**Date:** 2026-11-14
**Rating:** 3.5/10
**Confidence:** High for technical findings; keyword volumes/rankings not verified.

## Executive finding

The site is crawlable, bilingual, server-rendered, and has a populated sitemap, but its commercial SEO architecture is currently broken. Most pages inherit homepage metadata. Live tests showed the shop, a product, and a brand URL all declaring the homepage title and canonical. This can collapse the indexable catalog into the homepage in Google’s canonicalization system.

## Critical findings

### SEO-001 — Homepage canonical on commercial pages

- **Priority/severity:** P0 / Critical
- **Affected code:** Only `about/page.tsx`, `contact/page.tsx`, and `[locale]/layout.tsx` implement `generateMetadata`; product, brand, shop, note, journal, discovery, delivery, and guide pages do not.
- **Live evidence:**
  - `/en/shop` → title `MUSCHIO — Haute Parfumerie...`; canonical `/en`.
  - `/en/product/amouage-interlude-53-man` → same generic title; canonical `/en`.
  - `/en/brands/acqua-di-parma` → same generic title; canonical `/en`.
- **Impact:** Product/category pages may not index independently; keyword targeting and rich results are suppressed; duplicate-content signals become severe.
- **Fix:** Implement route-specific metadata with self-canonical, reciprocal `en-AE`/`ar-AE`, `x-default`, product/brand descriptions, OG/Twitter images, and explicit robots.
- **Acceptance:** Every sitemap URL returns a unique relevant title, description, self-canonical, reciprocal hreflang, and correct OG URL.

### SEO-002 — Fabricated or unsupported structured data

- **Priority/severity:** P0 / Critical rich-result/trust risk
- **Affected:** `apps/storefront/src/lib/seo.ts:24-99,117-203`
- **Evidence:** Defaults publish France as origin; price validity through 2027; free shipping across six countries; 1-3 day delivery; 4.95/48 aggregate rating; a Dubai Mall postal address/coordinates; 10:00-23:00 opening hours; social profiles; phone; authorized distributor, DHL, same-day, and Tabby/Tamara claims.
- **Catalog evidence:** Database contains four reviews, two approved/verified. The schema defaults to 48 reviews when values are absent.
- **Impact:** Google rich-result policy violations, Merchant Center suspension/disapproval, incorrect knowledge-graph association, and customer deception.
- **Fix:** Emit only database-backed/current facts. Omit `AggregateRating` unless genuine approved reviews exist for that product. Source shipping/returns from active settings. Remove physical address/social/authorization claims until documentary proof is available.
- **Acceptance:** Rich Results Test passes; rendered schema matches visible content and database values exactly.

### SEO-003 — Stale product slugs and URL/name mismatch

- **Priority/severity:** P1 / High
- **Live examples:**
  - Colonia Intensa → `/en/product/test`
  - Amouage Decision → `/en/product/oud-royal-prive`
  - Creed Aventus → `/en/product/creed-green-irish-tweed`
  - Valaya Exclusif → `/en/product/parfums-de-marly-delina-exclusif`
  - Purpose 50 → `/en/product/amouage-royal-tobacco`
  - Outlands → `/en/product/amouage-jubilation-40-man`
- **Impact:** Weak query relevance, misleading analytics/shares, poor trust, and redirect complexity.
- **Fix:** Create current descriptive slugs; retain immutable product IDs; add one-hop 301 mappings; update sitemap/internal links.
- **Acceptance:** Product name, H1, title, schema URL, canonical, internal links, and slug all describe the same product.

## High and medium findings

| ID | Priority | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| SEO-004 | P1 | Sitemap includes faceted query URLs | Four `?collection=` URLs in 138-URL sitemap. | Create clean collection routes or exclude query facets and canonicalize to stable landing pages. |
| SEO-005 | P2 | Static `lastModified` is always deployment/request time | `sitemap.ts:33` uses `new Date()` for static routes. | Use actual content update dates or omit. |
| SEO-006 | P1 | Global dynamic rendering/no-store | Root layout is force-dynamic; live cache header is private/no-store. | Cache public catalog/content with revalidation and tag invalidation. |
| SEO-007 | P1 | Legal URLs resolve to irrelevant canonicals | Privacy/terms redirect to guide fragments, which inherit homepage canonical and contain no policy. | Publish dedicated indexable policy pages with accurate metadata. |
| SEO-008 | P2 | No dedicated category architecture | Men/women/unisex/oud/Arabic/niche/gifts rely on shop filters or do not exist. | Build inventory-backed category landing pages with unique content. |
| SEO-009 | P2 | Sitemap hreflang keys use `en`/`ar`, while page metadata uses regional tags | `sitemap.ts:37-40`; layout uses `en-AE`/`ar-AE`. | Standardize regional hreflang and add `x-default` in sitemap output if supported. |
| SEO-010 | P2 | Product schema may state all items in stock | `inStock !== false` defaults to InStock. | Calculate per sellable variant and omit offers with invalid availability. |
| SEO-011 | P2 | Organization type/claims need validation | Uses `LuxuryStore`, invented physical data, and an Unsplash image. | Use `OnlineStore`/`Organization` with verified legal identity and owned assets. |
| SEO-012 | P3 | Root keyword meta contains broad repeated phrases | Layout keyword list applies globally. | Focus on titles/body/internal links; remove global keyword stuffing signals. |

## Positive technical signals

- `/robots.txt` and `/sitemap.xml` return 200.
- Robots disallow API, admin, account, and checkout patterns.
- Sitemap includes English/Arabic static, product, brand, note, and collection entries.
- Public content is rendered in HTML and accessible to crawlers.
- Root document has correct `lang` and RTL `dir` behavior.
- About and Contact have dedicated metadata, canonicals, alternates, and OG fields.
- Product and navigation images usually expose meaningful alt text.
- Legacy redirect mapping exists for products, brands, notes, and common pages.

## Indexability assessment

| Route family | Crawlable | Unique metadata | Canonical correct | Priority |
|---|---:|---:|---:|---|
| Homepage | Yes | Yes | Yes | Maintain |
| About/Contact | Yes | Yes | Yes | Maintain |
| Shop | Yes | No | No | P0 |
| Product | Yes | No | No | P0 |
| Brand | Yes | No | No | P0 |
| Note | Yes | No | No | P1 |
| Journal | Yes | No | No | P1 |
| Discovery/Guide/Delivery | Yes | No | No | P1 |
| Account/Checkout/Admin | Disallowed | Not assessed | Inherited metadata | Add explicit noindex as defense-in-depth |
| Privacy/Terms | No real page | No | No | P0 trust/legal |

## Multilingual SEO

- English and Arabic route trees exist, and the root layout sets language/direction correctly.
- Root alternates include `en-AE`, `ar-AE`, Saudi aliases, and `x-default`.
- Page-level reciprocity is absent on most routes because page metadata is absent.
- Arabic product/catalog text exists, but four of 24 product Arabic descriptions are below 80 characters.
- Arabic-specific URL slugs are not required, but localized titles/descriptions are required.
- The same product slug can be used across languages if each locale has a correct self-canonical and hreflang pair.

## Structured-data target design

1. One verified `Organization`/`OnlineStore` node from backend business settings.
2. `WebSite` with `SearchAction` only if the URL template works.
3. `BreadcrumbList` on product, brand, note, category, and journal pages.
4. `Product` + `Offer` per sellable variant or a valid aggregate offer.
5. `AggregateRating` only from approved genuine reviews and only when visible.
6. `MerchantReturnPolicy` and `OfferShippingDetails` only after policies/settings are operationally verified.
7. Never default country of origin, rating, review count, availability, delivery time, address, or social profile.

## Search measurement limitations

No Google Search Console, Keyword Planner, Ahrefs, or Semrush account was connected. Therefore:

- UAE monthly volume: **NOT VERIFIED**.
- Keyword difficulty: **NOT VERIFIED**.
- Current rank: **NOT VERIFIED**.
- Search-engine spot checks are directional only and are not reported as rankings.

## Acceptance checklist

- Crawl all 138 sitemap URLs and assert 200, unique title, one H1, self-canonical, valid hreflang, and non-empty description.
- Remove query-string sitemap entries or replace them with clean landing routes.
- Validate schema rendered HTML against database data.
- Submit sitemap in Search Console and monitor Page Indexing, canonical selection, Merchant Listings, and Product Snippets.
- Track non-brand impressions/clicks by landing page after 28 days before claiming SEO gains.
