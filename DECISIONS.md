# Architecture Decision Records (ADRs) — Muschio

## ADR 1: Turborepo + pnpm Monorepo Structure
- **Context**: Need a unified codebase shared between customer storefront, backend API, admin portal, and luxury design tokens.
- **Decision**: Adopt Turborepo with `pnpm` workspaces.
- **Consequences**: Fast builds, shared TypeScript contracts without code duplication, easy native execution on Windows PowerShell.

## ADR 2: Dedicated Notes Discovery (`/notes` & `/notes/[slug]`)
- **Context**: Master Build Prompt v9.0.0 mandates dedicated note discovery connecting raw ingredients directly to real catalog items.
- **Decision**: Modeled first-class `Note` entity and `ProductNote` relation with `position: TOP|HEART|BASE` and prominence.
- **Consequences**: Search, navigation, and PDP note chips link directly to `/notes/[slug]`, guaranteeing only published, non-fabricated perfumes appear.

## ADR 3: Concurrency Control via PostgreSQL Row Locking
- **Context**: Need to prevent overselling of high-value limited-run extraits during peak GCC drop events.
- **Decision**: Transactional 15-minute `InventoryReservation` using `SELECT FOR UPDATE` in PostgreSQL, backed by a 60-second background release worker.
- **Consequences**: Safe stock allocation under high concurrency without relying on Redis as the source of truth.
