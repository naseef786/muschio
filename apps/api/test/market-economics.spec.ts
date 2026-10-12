import { describe, it, expect } from "vitest";
import { MarketService } from "../src/services/market.service";

describe("Market Economics & Commercial Precision", () => {
  const marketService = new MarketService();

  it("calculates exact UAE totals with 5% VAT and free shipping above 500 AED", async () => {
    const outcome = await marketService.calculateMarketTotals({
      marketCode: "AE",
      items: [
        {
          variantId: "v1",
          quantity: 1,
          unitPrice: 1850,
          costPrice: 600,
        },
      ],
      discountAmount: 0,
      paymentMethod: "TABBY",
    });

    expect(outcome.marketCode).toBe("AE");
    expect(outcome.currency).toBe("AED");
    expect(outcome.subtotal).toBe(1850);
    expect(outcome.shippingFee).toBe(0); // 1850 >= 500 threshold -> free shipping
    expect(outcome.vatRatePercent).toBe(5);
    expect(outcome.vatAmount).toBe(92.5); // 1850 * 0.05
    expect(outcome.totalAmount).toBe(1942.5); // 1850 + 92.5
    expect(outcome.estimatedPaymentFee).toBe(106.84); // 1942.5 * 0.055 (Tabby)
  });

  it("applies standard shipping fee when order is beneath the free threshold", async () => {
    const outcome = await marketService.calculateMarketTotals({
      marketCode: "AE",
      items: [
        {
          variantId: "v-sample",
          quantity: 1,
          unitPrice: 65,
        },
      ],
      discountAmount: 0,
    });

    expect(outcome.subtotal).toBe(65);
    expect(outcome.shippingFee).toBe(30); // 65 < 500 threshold -> 30 AED shipping
    expect(outcome.vatAmount).toBe(3.25); // 65 * 0.05
    expect(outcome.totalAmount).toBe(98.25); // 65 + 3.25 + 30
  });

  it("calculates KSA totals with 15% VAT and free shipping above 600 SAR", async () => {
    const outcome = await marketService.calculateMarketTotals({
      marketCode: "SA",
      items: [
        {
          variantId: "v-roja",
          quantity: 1,
          unitPrice: 2200,
          costPrice: 800,
        },
      ],
      discountAmount: 100, // 100 SAR voucher
    });

    expect(outcome.marketCode).toBe("SA");
    expect(outcome.currency).toBe("SAR");
    expect(outcome.subtotal).toBe(2200);
    expect(outcome.discountAmount).toBe(100);
    expect(outcome.vatRatePercent).toBe(15);
    expect(outcome.shippingFee).toBe(0); // 2100 >= 600 SAR threshold
    expect(outcome.vatAmount).toBe(315); // (2200 - 100) * 0.15
    expect(outcome.totalAmount).toBe(2415); // 2100 + 315
  });
});
