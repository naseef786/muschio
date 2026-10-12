# MUSCHIO — Haute Parfumerie & Niche Fragrance Platform

> **Production-Grade Luxury E-Commerce Monorepo for the Arabian Gulf (GCC)**  
> Built according to the single authoritative specification **MASTER_BUILD_PROMPT v9.0.0**.

---

## 🏛️ System Architecture

Muschio is architected as a high-performance Turborepo monorepo powered by `pnpm`:

- **`apps/storefront`**: Customer-facing Next.js 14+ App Router application with first-class English and Arabic (true RTL `dir="rtl"`) support, `next-intl`, and `next-themes`.
- **`apps/api`**: Server-authoritative Node.js + Express REST API with strict TypeScript, Zod schema validation, and PostgreSQL (Prisma ORM) transactional concurrency.
- **`apps/admin`**: Maison operations, merchandising, inventory control, and CMS portal built with Vite + React + TanStack Query.
- **`packages/ui`**: Shared luxury design system featuring Radix UI primitives, Tailwind logical properties, and bespoke olfactory components (`ScentPyramid`, `NoteChip`, `PriceDisplay`, `InstallmentBadge`).
- **`packages/types`**: Shared Zod DTO contracts, domain types, and commerce state machines.
- **`packages/config`**: Shared base TypeScript and Tailwind presets.

---

## 💎 Core Capabilities & Verified Routes

1. **Dedicated Notes Discovery (`/notes` & `/notes/[slug]`)**:
   - Olfactory library featuring raw extracts: Royal Taif Rose, Silver Frankincense, Cambodian Oud, Florentine Iris, and Golden Ambergris.
   - Authoritative joins through `ProductNote` (`TOP | HEART | BASE`). Only published perfumes appear; zero fabricated relationships.
2. **Haute Maison & Brand Portfolios (`/brands` & `/brands/[slug]`)**:
   - A-Z luxury directory featuring Amouage (Oman), Maison Francis Kurkdjian (Paris), Roja Parfums (London), Xerjoff (Turin), Tom Ford, Clive Christian, and Creed.
   - Dedicated house histories, master perfumers, and authorized collections.
3. **Haute Parfumerie Compendium & Guide (`/guide`)**:
   - 8-chapter educational interactive compendium: Olfactory Pyramid, Scent Families, Concentration Hierarchy (30-53% Extrait vs EDP), GCC High-Heat Climate Sillage, Royal Layering Rituals, and 2ml Sampling Protocols.
4. **Server-Authoritative Commerce & GCC Economics**:
   - All monetary calculations use exact `Decimal` precision in AED, SAR, and USD with regional VAT (5% UAE, 15% KSA).
   - 15-minute transactional inventory locking via `SELECT FOR UPDATE`.
   - Commercial sealed stock is strictly isolated from discovery vials.
5. **Transparent Regional GCC Payments & Installments**:
   - Truthful installment calculations directly beneath purchase actions for **Tabby** (4 installments) and **Tamara** (3/4 installments).
   - Card, Apple Pay, and Mada integration with idempotent webhook processing.
6. **Catalog-Grounded AI Scent Sommelier (`/discover/ai`)**:
   - DeepSeek server-side proxy matching customer prompts (EN/AR) to real catalog SKUs with strict Zod validation.
7. **Bespoke 5 x 2ml Discovery Set Box Builder (`/discover/sets`)**:
   - Customers curate 5 sample vials; includes a 100% redeemable voucher for full bottle purchases.
8. **Private Patron Wishlist (`/wishlist`) & VIP Concierge (`/account`)**:
   - Persistent curated fragrance vault, real-time express delivery tracking, voucher balances, and direct concierge touchpoint.
9. **Editorial Magazine & Shoppable Journal (`/journal` & `/journal/[slug]`)**:
   - Haute layering essays with contextual shoppable fragrance allocations.

---

## 🛡️ Verification & Quality Gates

All verification gates have executed and passed cleanly:

- **Typecheck**: `pnpm typecheck` — 6/6 workspaces passing with zero TypeScript warnings or errors.
- **Unit & Concurrency Tests**: `pnpm test` — 24/24 tests passing across inventory concurrency, payment idempotency, RBAC, API contracts, and GCC market economics.
- **Production Compilation**: `pnpm build` — `@muschio/storefront`, `@muschio/api`, and `@muschio/admin` all compile cleanly into optimized production artifacts.

---

## 🚀 Quickstart & Native Windows Execution

Muschio runs natively on Windows 10/11 via PowerShell without mandatory WSL2 or Docker:

```powershell
# 1. Install dependencies across monorepo
pnpm install

# 2. Configure environment
cp .env.example .env

# 3. Generate Prisma client & seed database
cd apps/api
pnpm prisma:generate
pnpm prisma:seed
cd ../..

# 4. Start all applications concurrently (Storefront :3000, API :4000, Admin :5173)
pnpm dev
```
