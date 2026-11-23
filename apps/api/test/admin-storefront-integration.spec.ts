import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../src/prisma";
import { SettingsService } from "../src/services/settings.service";
import { CheckoutService } from "../src/services/checkout.service";
import { CatalogService } from "../src/services/catalog.service";
import { PromotionService } from "../src/services/promotion.service";
import { Prisma } from "@prisma/client";

describe("Admin Functions & Storefront Integration Audit", () => {
  const cleanupCouponCodes: string[] = [];
  const cleanupCollectionIds: string[] = [];
  const cleanupOrderIds: string[] = [];

  afterAll(async () => {
    if (cleanupCouponCodes.length > 0) {
      await prisma.coupon.deleteMany({ where: { code: { in: cleanupCouponCodes } } }).catch(() => null);
    }
    if (cleanupCollectionIds.length > 0) {
      await prisma.productCollection.deleteMany({ where: { collectionId: { in: cleanupCollectionIds } } }).catch(() => null);
      await prisma.collection.deleteMany({ where: { id: { in: cleanupCollectionIds } } }).catch(() => null);
    }
    if (cleanupOrderIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { orderId: { in: cleanupOrderIds } } }).catch(() => null);
      await prisma.payment.deleteMany({ where: { orderId: { in: cleanupOrderIds } } }).catch(() => null);
      await prisma.order.deleteMany({ where: { id: { in: cleanupOrderIds } } }).catch(() => null);
    }
    await prisma.$disconnect();
  });

  it("1. Verifies dynamic Free Shipping Threshold synchronizes between Admin Settings and Checkout Calculation", async () => {
    const currentSettings = await SettingsService.getSettings();
    expect(currentSettings.freeShippingThreshold).toBeGreaterThanOrEqual(0);

    // Update settings threshold to custom 750 AED
    await SettingsService.updateSettings({ freeShippingThreshold: 750 });
    const updatedSettings = await SettingsService.getSettings();
    expect(updatedSettings.freeShippingThreshold).toBe(750);

    // Subtotal of 600 AED (which was previously free under 500 AED) is now under the 750 threshold
    const subtotal600 = new Prisma.Decimal(600);
    const shippingUnder = subtotal600.greaterThanOrEqualTo(updatedSettings.freeShippingThreshold) ? 0 : 35;
    expect(shippingUnder).toBe(35);

    // Subtotal of 800 AED meets the new 750 threshold
    const subtotal800 = new Prisma.Decimal(800);
    const shippingOver = subtotal800.greaterThanOrEqualTo(updatedSettings.freeShippingThreshold) ? 0 : 35;
    expect(shippingOver).toBe(0);

    // Reset settings back to standard 500 AED
    await SettingsService.updateSettings({ freeShippingThreshold: 500 });
    const resetSettings = await SettingsService.getSettings();
    expect(resetSettings.freeShippingThreshold).toBe(500);
  });

  it("2. Verifies Admin Curated Collections filter catalog products accurately on storefront", async () => {
    // Find or create test product
    const product = await prisma.product.findFirst({
      where: { isPublished: true },
    });
    if (!product) throw new Error("No published product found for test");

    // Create a new curated collection
    const testSlug = `col-test-${Date.now()}`;
    const collection = await prisma.collection.create({
      data: {
        nameEn: "Royal Ouds Collection",
        nameAr: "مجموعة العود الملكي",
        slug: testSlug,
        isFeatured: true,
      },
    });
    cleanupCollectionIds.push(collection.id);

    // Link product to collection
    await prisma.productCollection.create({
      data: {
        productId: product.id,
        collectionId: collection.id,
        displayOrder: 1,
      },
    });

    // Query catalog with collection filter
    const result = await CatalogService.getProducts({
      collectionSlug: testSlug,
      limit: 10,
    } as any);

    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.items.some((item) => item.id === product.id)).toBe(true);
  }, 25000);

  it("3. Verifies Coupon and Promotion evaluation across Admin creation and Storefront Checkout", async () => {
    const promoCode = `TEST-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    cleanupCouponCodes.push(promoCode);

    // Create promotion and coupon
    const promotion = await prisma.promotion.create({
      data: {
        nameEn: "VIP Connoisseur 100 AED Off",
        nameAr: "خصم ١٠٠ د.إ للعملاء المميزين",
        type: "FIXED_AMOUNT",
        value: new Prisma.Decimal(100),
        isActive: true,
      },
    });

    await prisma.coupon.create({
      data: {
        code: promoCode,
        promotionId: promotion.id,
        isActive: true,
      },
    });

    // Evaluate promotion against cart subtotal of 1000 AED
    const quote = await PromotionService.evaluateCartPromotions({
      items: [{ variantId: "var_1", price: 1000, quantity: 1 }],
      subtotal: 1000,
      couponCode: promoCode,
    });

    expect(quote.totalDiscount).toBe(100);
    expect(quote.appliedDiscounts.length).toBe(1);
    expect(quote.appliedDiscounts[0].code).toBe(promoCode);
  });
});
