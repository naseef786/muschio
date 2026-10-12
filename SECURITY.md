# Security Policy — Muschio E-Commerce Platform

## Security Controls
- **Zero Secrets Committed**: All credentials, keys, and webhook secrets are loaded from process environment variables.
- **Strict Zod Boundary Validation**: Every incoming HTTP request payload to `apps/api` is validated using strict Zod schemas before hitting domain logic.
- **OWASP Alignment**:
  - Helmet enabled for secure HTTP headers.
  - CORS allowlisted for authorized storefront and admin origins.
  - Sensitive payment attributes and customer passwords hashed using `bcrypt` (10 rounds).
  - Rate limiting on public and AI endpoints.
- **Role-Based Access Control (RBAC)**:
  - Admin endpoints guarded by `requireAdminAuth` and `requireRoles` (`SUPER_ADMIN`, `CATALOG_MANAGER`, `INVENTORY_MANAGER`, `ORDER_MANAGER`, `EDITOR`).
  - All mutating admin actions produce immutable entries in `AuditLog`.
