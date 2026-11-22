# Operations Runbook — Muschio Luxury E-Commerce Platform

## Windows Setup & Daily Operations

### Prerequisites
- Node.js v20+ or v22+
- pnpm v9+ or v10+ (`npm install -g pnpm`)
- PostgreSQL instance (Neon, Supabase, or local PostgreSQL)

### Step 1: Install Monorepo Dependencies
```powershell
pnpm install
```

### Step 2: Database Migration & Seeding
```powershell
cd apps/api
pnpm prisma:generate
pnpm prisma:seed
cd ../..
```

### Step 3: Run Development Servers
```powershell
pnpm dev
```
- Storefront: `http://localhost:3000`
- REST API: `http://localhost:4000/api/v1`
- Admin Operations Portal: `http://localhost:5173`

The local admin proxies `/api` requests through the storefront on port 3000. If sign-in reports an empty or invalid response, confirm the storefront is running and ready before retrying. Do not put seeded or production administrator credentials in the admin UI or client bundle.

### Admin count semantics

- The sidebar Orders badge is the server total across all order statuses. The Orders list loads the most recent 100 records by default; its row count is not the database total.
- The sidebar Products badge is the server total including published products and drafts. The Products page shows those two counts separately.
- Order and product lists are kept in memory, not browser storage. Server totals refresh at login, every minute, and after relevant admin changes. If refresh fails, the last confirmed totals remain visible and are marked as possibly out of date.

### Step 4: Quality & Verification Gates

Product-image smoke check: product cards and the product-detail image use matching frosted-glass previous/next buttons and a compact dot rail. There is no visible **View product** overlay. Buttons and dots change photos; touch swipes and wheel/trackpad movement do not change photos. Image/title links still open product details, and wishlist toggling remains independent. Check multi-image wraparound, selecting dots, thumbnail synchronization on the detail page, reduced motion, keyboard focus/arrows, light/dark themes, and English/Arabic layouts. Single-image products show no arrows or dots. Check at 320px, 390px and desktop widths; collection scrolling must still work.

Home offer-card smoke check: discounted products use the shared product-card image controls and pricing layout.

```powershell
# Run linting across all monorepo workspaces
pnpm run lint

# Run TypeScript typechecks across all monorepo workspaces
pnpm run typecheck

# Run unit, integration, and security tests
pnpm run test

# Run production build validation across all workspaces
pnpm run build
```

