import { describe, expect, it } from "vitest";
import { DeliveryRequestSchema } from "@muschio/types";
import { quoteDelivery } from "../src/services/delivery.service";
const rule = { id: "uae-standard", country: "AE", name: "Standard", nameAr: "عادي", feeFils: 3500, freeAboveFils: 50000, minBusinessDays: 2, maxBusinessDays: 4 };
describe("delivery policies", () => {
  it("keeps unconfigured delivery inactive", () => {
    expect(quoteDelivery({ country: "AE", subtotal: 600, currency: "AED" }, false, [rule])).toEqual({ enabled: false, currency: "AED", services: [] });
  });
  it("isolates country coverage", () => {
    expect(quoteDelivery({ country: "SA", subtotal: 100, currency: "AED" }, true, [rule]).services).toEqual([]);
  });
  it("uses exact fils and honors the free-delivery boundary", () => {
    expect(quoteDelivery({ country: "AE", subtotal: 499.99, currency: "AED" }, true, [rule]).services[0]?.feeFils).toBe(3500);
    expect(quoteDelivery({ country: "AE", subtotal: 500, currency: "AED" }, true, [rule]).services[0]?.feeFils).toBe(0);
  });
  it("fails closed for malformed configuration and duplicate service ids", () => {
    for (const rules of [[{ ...rule, feeFils: -1 }], [{ ...rule, maxBusinessDays: 1 }], [rule, rule]]) {
      expect(quoteDelivery({ country: "AE", subtotal: 1, currency: "AED" }, true, rules).enabled).toBe(false);
    }
  });
  it("rejects unsupported countries, currencies, and negative totals", () => {
    for (const input of [{ country: "US", subtotal: 1 }, { country: "AE", subtotal: -1 }, { country: "AE", subtotal: 1, currency: "USD" }]) expect(DeliveryRequestSchema.safeParse(input).success).toBe(false);
  });
});
