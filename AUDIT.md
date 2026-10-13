# Muschio audit and redesign

## Implemented

- Replaced the full-screen glass hero with an editorial split layout, warm ivory canvas, moss accents, image-led fragrance edits, discovery-set feature, journal section, and clear scent-consultation path.
- Rebuilt navigation with a centered masthead, separate desktop category row, mobile navigation, search, and shopping bag.
- Native dialogs provide keyboard focus containment, Escape dismissal, and focus restoration. Added focus indicators, reduced-motion support, labeled checkout inputs, mobile sizing, and Arabic copy/RTL-compatible layouts.
- Removed homepage buttons that falsely reported adding products. Collection cards now lead to the relevant shopping experience.
- New bags start empty; persisted empty bags remain empty after reload.
- Checkout no longer inserts personal demo details or manufactures an order after a failed API request. It uses a visitor session cart, verifies API responses, and preserves the bag on failure.
- Delivery contracts, configuration, endpoint, checkout selection, server repricing, and extension interface are prepared with inactive defaults.

## Existing launch risks requiring further integration

- Catalog pages contain fallback/demo product identifiers; these cannot be submitted as real database variants. Checkout rejects these rather than confirming a fabricated order.
- Payment initiation and callback verification are not connected to the storefront order-submission flow. Order acceptance is not payment success.
- Existing cart, order, and fulfillment API routes need ownership checks before customer data can be considered production safe.
- Existing inventory reservation is called inside a separate transaction from order creation; transaction and concurrency behavior need database integration testing.
- Product imagery uses illustrative stock photography, not verified packshots. Replace with approved assets before a commercial launch.
- Vercel project binding and production credentials were not present in the checkout. A successful local build or Git push does not by itself prove live deployment.
