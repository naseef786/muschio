# Muschio Agent Governance & Project Recap

This file is the quick-start context for any agent working in the Muschio repository. Read it before making changes, then consult the linked documents for detail.

## Project

Muschio is a luxury niche and designer fragrance e-commerce platform for the GCC. It is a pnpm/Turborepo monorepo using TypeScript, Next.js, Express, React/Vite, Prisma, PostgreSQL/Neon, and Cloudinary media storage.

The authoritative project documents are:

- `README.md` — product scope, routes, setup, and verification status
- `ARCHITECTURE.md` — system design and commerce invariants
- `DECISIONS.md` — architecture decisions
- `RUNBOOK.md` — local operations and quality gates
- `MUSCHIO_PRODUCTION_FIX_ROADMAP.md` — remaining production work
- `SECURITY.md` — security controls and reporting policy

## Repository Map

- `apps/storefront` — customer storefront, Next.js App Router, English/Arabic and RTL support
- `apps/api` — server-authoritative Express REST API, Prisma, PostgreSQL, validation, commerce workflows
- `apps/admin` — operations, catalog, inventory, CMS, promotions, and product administration
- `packages/types` — shared Zod schemas, DTOs, and domain contracts
- `packages/ui` — shared UI and design-system components
- `packages/config` — shared TypeScript and Tailwind configuration

## Non-Negotiable Engineering Rules

1. Keep business authority on the API. Do not move prices, tax, inventory, discounts, payment state, or order state decisions into the browser.
2. Preserve exact monetary arithmetic and existing GCC VAT/currency rules. Use the established server-side decimal conventions.
3. Treat inventory changes as transactional and preserve locking, reservation, and idempotency behavior.
4. Validate external input at API boundaries with the existing shared contracts and schemas.
5. Preserve authentication, RBAC, ownership checks, and admin authorization. Never expose order or shipment data by identifier alone.
6. Keep secrets in environment variables. Never print, commit, or paste values from `.env`, API keys, JWT secrets, payment credentials, or Cloudinary credentials.
7. Do not claim operational capabilities that are not implemented. Delivery remains configuration-driven and inactive unless explicitly enabled and operationally approved.
8. Prefer small, focused changes. Preserve unrelated user work and do not reset or overwrite the working tree.
9. Do not modify production data or external services without explicit authorization.
10. When changing behavior, update the relevant tests and documentation.

## Media and Product Import Context

- Product images are stored as URL strings, with product galleries represented by an `images` array and the first image acting as the cover.
- The admin product editor can upload multiple local images to Cloudinary, add image URLs manually, remove images, reorder them, and choose the cover image.
- Bulk Excel import reads the first worksheet as tabular data. It supports an `imageUrl` URL column, but embedded images inside Excel are not currently preserved.
- Products imported without an image currently receive the configured placeholder URL.
- The admin does not yet provide a visual Cloudinary asset-library browser. Adding one requires a secure asset-list endpoint plus a paginated/searchable picker in the admin UI.

## Environment and External Services

`.env` is local and sensitive. Use `.env.example` as the variable reference, and inspect only variable names unless the user explicitly authorizes another safe diagnostic.

Important integrations include:

- Neon/PostgreSQL through `DATABASE_URL`
- Cloudinary for image media
- Stripe, Tabby, and Tamara for payments/installments
- DeepSeek for the server-side AI scent discovery proxy
- Redis where configured for rate limiting or shared state
- SMTP for transactional email

## Verification

From the repository root:

```powershell
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Local services:

- Storefront: `http://localhost:3000`
- API: `http://localhost:4000`
- Admin: `http://localhost:5173`

The API build may run Prisma client generation. On restricted Windows environments, esbuild may require permission to spawn child processes; this is an environment issue rather than automatically a code failure.

## Agent Workflow

1. Read this file and the relevant authoritative document before editing.
2. Inspect existing patterns and tests before introducing a new abstraction.
3. State assumptions when a requirement is ambiguous.
4. Make the smallest scoped change requested.
5. Run focused checks first, then the relevant monorepo gates.
6. Report files changed, verification performed, remaining warnings, and any follow-up work.

## Customer Language & Accessibility

- Write customer-facing English for a general audience. Prefer short, familiar words such as “Shop”, “Brands”, “Find Your Scent”, “Track Order”, “Bottle”, and “Shipping”.
- Avoid internal, luxury-marketing, or specialist terms unless they are explained in the same view. Keep brand names and product names unchanged.
- Keep the shared customer vocabulary in `apps/storefront/src/lib/customer-copy.ts`; reuse it instead of adding one-off translations or replacements.
- Arabic customer text must remain valid UTF-8. Check for mojibake such as `Ã`, `Â`, `Ø`, or `Ù` before release.
- Preserve comfortable reading sizes, line spacing, wrapping, and touch targets on narrow screens. Do not solve overflow by making text smaller or tightly packed.

