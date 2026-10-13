# Muschio commerce activation

The storefront is deployed separately from the API. Payments are deliberately unavailable until the API, database, and Stripe settings are configured. No real payment credentials were available during this task.

## API deployment

Create a separate Vercel project from this repository with root directory `apps/api` and enable inclusion of workspace files outside the root directory. The source exports the Express app for Vercel and avoids starting a listener or background timer there. The checked-in Vercel configuration builds shared contracts and generates the Prisma client. Alternatively, a persistent Node host can run the existing API start command.

Set these API environment variables through the hosting dashboard:

- `DATABASE_URL`: a PostgreSQL connection string, using the database provider's serverless connection pool when appropriate.
- `JWT_SECRET` and `ADMIN_JWT_SECRET`: two different cryptographically random secrets, each at least 32 characters. Published example keys are rejected.
- `CORS_ORIGIN=https://muschio.vercel.app` (add explicitly approved storefront/admin origins, separated by commas).
- `STOREFRONT_URL=https://muschio.vercel.app`.
- `CRON_SECRET`: a separate random secret of at least 32 characters for inventory reconciliation.

Initialize an empty database using the Prisma schema and load approved catalog data. Do not apply schema synchronization to an existing production database without reviewing a migration. The storefront uses published products and their real variant IDs; preview products cannot be purchased.

For a serverless API, configure a trusted scheduler to call `GET /internal/reconcile-inventory` every minute with `Authorization: Bearer <CRON_SECRET>`. Choose a scheduler/hosting plan that supports this interval; a daily schedule is insufficient for short inventory holds. A persistent Node host already starts its reconciliation timer. Do not rely on a serverless background timer.

Set `NEXT_PUBLIC_API_URL=https://<your-api-host>/api/v1` on the storefront Vercel project and redeploy it. Never place signing secrets or Stripe secret keys in a `NEXT_PUBLIC_` variable.

## Stripe Checkout

Keep `PAYMENTS_ENABLED=false` while testing deployment. Use Stripe test-mode credentials first:

- `PAYMENT_PROVIDER=stripe`.
- `STRIPE_SECRET_KEY`: the Stripe secret API key for the account.
- `STRIPE_WEBHOOK_SECRET`: the signing secret for this exact webhook endpoint.
- Register `https://<your-api-host>/api/v1/webhooks/stripe` for `checkout.session.completed` and `checkout.session.expired`.
- Set `PAYMENTS_ENABLED=true` only after configuration is complete.

Verify test checkout, cancel/resume, expiration, invalid signatures, duplicate deliveries, insufficient stock, and return-page status using the deployed API and a test database. Use live-mode keys only after this verification.

Payment amounts come from the order's Decimal total. Sessions are idempotent by payment ID. Checkout holds inventory for 35 minutes to cover Stripe's minimum 30-minute checkout session window; sessions expire after roughly 31 minutes. Only verified paid Stripe notifications mark orders paid. A return-page visit, client status, cash-on-delivery request, or unsigned callback cannot mark an order paid.

If a verified capture arrives after inventory has already expired/released, the transaction rejects fulfillment and the provider notification is retried. Investigate and reconcile/refund through Stripe before changing order state; do not bypass the stock or signature checks.

## Access and verification

Guest sessions are signed, last up to 30 days, and are sent in the `x-storefront-session` header. Cart and order IDs alone do not grant access. Guest order ownership is linked to retained inventory reservation records, which must not be deleted without migrating that ownership data.

Admin tokens are purpose- and audience-bound; each request reads the active user's current database role. Existing unsigned/example-secret tokens must be replaced by a new login. Customer review submission is disabled until verified customer login exists. Returns are restricted to authorized order managers.

Tests include real HTTP authorization checks, signature/replay/amount guards, and transaction-boundary checks with mocked database clients. A real PostgreSQL concurrency/rollback test and Stripe test-mode end-to-end verification are still required; no live charge was attempted.

Primary references: [Stripe Checkout sessions](https://docs.stripe.com/api/checkout/sessions/create), [Stripe webhook signatures](https://docs.stripe.com/webhooks/signature), [Express on Vercel](https://vercel.com/docs/frameworks/backend/express).
