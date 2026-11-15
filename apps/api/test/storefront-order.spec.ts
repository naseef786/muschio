import { describe, expect, it } from "vitest";
import { storefrontOrder } from "../src/services/storefront-order";

describe("storefrontOrder", () => {
  it("never exposes NaN prices when a legacy item has no stored total", () => {
    const result = storefrontOrder({
      id: "order-id",
      orderNumber: "MSC-TEST",
      status: "PAYMENT_PENDING",
      currency: "AED",
      totalAmount: 1550,
      items: [
        {
          id: "item-id",
          productNameEn: "Test fragrance",
          productNameAr: "Test fragrance",
          quantity: 1,
          totalPrice: undefined,
          unitPrice: 1550,
        },
      ],
    });

    expect(result.totalAmount).toBe(1550);
    expect(result.items[0].totalPrice).toBe(1550);
    expect(Number.isFinite(result.items[0].totalPrice)).toBe(true);
  });

  it("uses a safe zero value when both legacy price fields are unavailable", () => {
    const result = storefrontOrder({
      id: "order-id",
      orderNumber: "MSC-TEST",
      status: "PAYMENT_PENDING",
      totalAmount: "not-a-number",
      items: [{ id: "item-id", quantity: 1 }],
    });

    expect(result.totalAmount).toBe(0);
    expect(result.items[0].totalPrice).toBe(0);
    expect(Number.isNaN(result.items[0].totalPrice)).toBe(false);
  });
});
