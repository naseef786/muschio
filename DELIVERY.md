# Delivery module

Delivery is inactive by default. The storefront exposes country-specific options through POST /api/v1/delivery/quote, shared validated contracts, a delivery-information page, and checkout selection. Checkout recalculates the selected service from server-side prices. No courier booking or live tracking is claimed.

To activate, set DELIVERY_ENABLED=true on the API and supply DELIVERY_RULES_JSON as a JSON array of policies. Each policy needs a unique id, country (AE/SA/QA/KW/BH/OM), English and Arabic names, feeFils, minBusinessDays, and maxBusinessDays. Optional freeAboveFils is the free-shipping threshold. Rates are AED only; other currencies are rejected. Invalid configuration fails closed.

Example configuration (illustrative; obtain approved operational rates before activation):

```json
[{"id":"uae-standard","country":"AE","name":"Standard delivery","nameAr":"التوصيل العادي","feeFils":3500,"freeAboveFils":50000,"minBusinessDays":2,"maxBusinessDays":4}]
```

The DeliveryProvider interface is the extension point for a courier. Connect it server-side to existing Fulfillment and Shipment records. Before launch, add authenticated/idempotent carrier webhooks, operational retry handling, rate approval, address validation, and authorized customer tracking access. Courier credentials must stay in server environment variables.

The existing manual fulfillment endpoints remain separate. Do not expose shipment information using an order id alone; add customer/session ownership authorization before making tracking public.
