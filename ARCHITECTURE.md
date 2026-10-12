# System Architecture — Muschio Luxury E-Commerce Platform

## Monorepo Dependency Graph

```
                   +------------------------+
                   |    @muschio/config     |
                   +-----------+------------+
                               |
               +---------------+---------------+
               |                               |
               v                               v
     +-------------------+           +-------------------+
     |  @muschio/types   |           |   @muschio/ui     |
     +---------+---------+           +---------+---------+
               |                               |
       +-------+-------+---------------+-------+
       |               |               |
       v               v               v
+--------------+ +-----------+ +---------------+
|   apps/api   | |apps/store | |  apps/admin   |
+--------------+ +-----------+ +---------------+
```

## Commerce Invariants
1. **Decimal Monetary Precision**: No floating-point math is used for price, tax, discount, or payment amounts.
2. **Deterministic Locking**: Inventory reservations hold a 15-minute TTL created inside a transactional `SELECT FOR UPDATE` block in PostgreSQL.
3. **Dedicated Notes Discovery**: `/notes/[slug]` queries published perfumes joined directly via the `ProductNote` table.
4. **Payment Idempotency**: Payment provider webhooks check existing `WebhookEvent.eventId` before triggering order state changes.
5. **Separation of Stock**: Sealed inventory and tester sample vials have distinct counters in the `Inventory` table.
