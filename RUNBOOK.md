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

### Step 4: Quality & Verification Gates
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

