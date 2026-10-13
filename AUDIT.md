# Muschio audit and redesign

## Implemented

- Replaced the full-screen glass hero with an editorial split layout, warm ivory canvas, moss accents, image-led fragrance edits, discovery-set feature, journal section, and clear scent-consultation path.
- Rebuilt navigation with a centered masthead, separate desktop category row, mobile navigation, search, and shopping bag.
- Native dialogs provide keyboard focus containment, Escape dismissal, and focus restoration. Added focus indicators, reduced-motion support, labeled checkout inputs, mobile sizing, and Arabic copy/RTL-compatible layouts.
- Removed homepage buttons that falsely reported adding products. Collection cards now lead to the relevant shopping experience.
- New bags start empty; persisted empty bags remain empty after reload.
- Checkout no longer inserts personal demo details or manufactures an order after a failed API request. It uses a visitor session cart, verifies API responses, and preserves the bag on failure.
- Delivery contracts, configuration, endpoint, checkout selection, server repricing, and extension interface are prepared with inactive defaults.

## Commerce follow-up implemented

- Live catalog projections use real database variant IDs and omit internal cost/warehouse data. Preview products cannot be purchased; unknown product URLs do not silently show another fragrance.
- Replaced fake account orders, vouchers, payment confirmations, and totals with session-owned server data and unavailable states.
- Added real Stripe hosted Checkout, signed raw-body webhook verification, timestamp tolerance, event replay checks, reference/amount/currency checks, and atomic payment/inventory state updates. Removed mock card auto-capture and unsigned legacy webhooks.
- Signed guest sessions control cart, checkout, order, payment-session, and fulfillment access. Body/query customer IDs do not determine the session. Disabled administrator accounts and current roles are checked on every authenticated request.
- Checkout and inventory reservations share one transaction. Inventory rows are locked in deterministic order. Expiration/release uses row locking and conditional claims.
- Added serverless API deployment preparation and an authenticated reconciliation endpoint.

## Remaining activation and verification requirements

- The API is not deployed yet. Configure PostgreSQL, independent signing secrets, the storefront API URL, Stripe keys/webhook endpoint, and a reliable inventory scheduler using COMMERCE_SETUP.md.
- API/payment/ownership tests use mocked database clients where appropriate. Real PostgreSQL concurrency tests and Stripe test-mode end-to-end verification remain required before accepting live payments.
- Discovery-set ordering and customer review sign-in remain unavailable until their real commerce/customer integrations are implemented.
- Product imagery uses illustrative stock photography, not verified packshots. Replace with approved assets before a commercial launch.
- The storefront deployment is verified separately through Vercel status and the live page; the API and Stripe activation are not implied by a storefront deployment.
