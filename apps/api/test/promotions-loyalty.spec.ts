import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database layer
const mockDb = vi.hoisted(() => ({
  promotion: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  coupon: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  promotionRedemption: {
    create: vi.fn(),
    findMany: vi.fn(),
    aggregate: vi.fn(),
  },
  giftCard: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  },
  giftCardTransaction: {
    create: vi.fn(),
  },
  loyaltyProgramConfig: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  loyaltyTier: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  loyaltyTransaction: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  customer: {
    findUnique: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  businessEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  order: {
    count: vi.fn(),
    findUnique: vi.fn(),
  },
  voucher: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  voucherRedemption: {
    create: vi.fn(),
  },
  $transaction: vi.fn((fn: any) => fn(mockDb)),
}));

vi.mock("../src/prisma", () => ({ prisma: mockDb }));
vi.mock("../src/db/client", () => ({ prisma: mockDb }));

import { PromotionService } from "../src/services/promotion.service";
import { LoyaltyService } from "../src/services/loyalty.service";
import { GiftCardService } from "../src/services/gift-card.service";

describe("Promotions, Vouchers, Gift Cards & Loyalty Architecture Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Promotion Engine & Automatic Discounts", () => {
    it("correctly calculates a percentage discount when cart meets minimum spend", async () => {
      mockDb.promotion.findMany.mockResolvedValueOnce([
        {
          id: "promo-10-pct",
          nameEn: "Eid Al Fitr 10% Off",
          type: "PERCENTAGE",
          value: 10,
          minSpend: 500,
          maxDiscount: 200,
          priority: 1,
          isStackable: true,
          isActive: true,
          startsAt: new Date(Date.now() - 86400000),
          endsAt: new Date(Date.now() + 86400000),
          targetProductIds: [],
          targetCategoryIds: [],
          targetBrandIds: [],
          excludedProductIds: [],
        },
      ]);

      const quote = await PromotionService.evaluateCartPromotions({
        items: [
          {
            productId: "prod-clive-1",
            variantId: "var-1",
            quantity: 1,
            price: 1500,
          },
        ],
      });

      expect(quote.originalSubtotal).toBe(1500);
      expect(quote.automaticDiscountTotal).toBe(150); // 10% of 1500
      expect(quote.finalTotal).toBe(1350);
      expect(quote.appliedPromotions).toHaveLength(1);
      expect(quote.appliedPromotions[0].id).toBe("promo-10-pct");
    });

    it("caps percentage discount at maxDiscount limit", async () => {
      mockDb.promotion.findMany.mockResolvedValueOnce([
        {
          id: "promo-20-capped",
          nameEn: "20% Off Capped at 100 AED",
          type: "PERCENTAGE",
          value: 20,
          minSpend: 200,
          maxDiscount: 100, // Cap
          priority: 1,
          isStackable: false,
          isActive: true,
          startsAt: new Date(Date.now() - 86400000),
          endsAt: null,
          targetProductIds: [],
          targetCategoryIds: [],
          targetBrandIds: [],
          excludedProductIds: [],
        },
      ]);

      const quote = await PromotionService.evaluateCartPromotions({
        items: [
          {
            productId: "prod-roja-1",
            variantId: "var-roja",
            quantity: 1,
            price: 2500,
          },
        ],
      });

      // 20% of 2500 is 500, but capped at 100 AED
      expect(quote.automaticDiscountTotal).toBe(100);
      expect(quote.finalTotal).toBe(2400);
    });

    it("rejects promotion when cart subtotal is beneath minimum spend threshold", async () => {
      mockDb.promotion.findMany.mockResolvedValueOnce([
        {
          id: "promo-vip-1000",
          nameEn: "VIP 100 AED Off Over 1000 AED",
          type: "FIXED_AMOUNT",
          value: 100,
          minSpend: 1000,
          maxDiscount: null,
          priority: 1,
          isStackable: false,
          isActive: true,
          startsAt: new Date(Date.now() - 86400000),
          endsAt: null,
          targetProductIds: [],
          targetCategoryIds: [],
          targetBrandIds: [],
          excludedProductIds: [],
        },
      ]);

      const quote = await PromotionService.evaluateCartPromotions({
        items: [
          {
            productId: "prod-sample-vial",
            variantId: "var-vial",
            quantity: 2,
            price: 150, // total 300 < 1000
          },
        ],
      });

      expect(quote.automaticDiscountTotal).toBe(0);
      expect(quote.appliedPromotions).toHaveLength(0);
      expect(quote.finalTotal).toBe(300);
    });

    it("unlocks free shipping when promotion type is FREE_SHIPPING and conditions match", async () => {
      mockDb.promotion.findMany.mockResolvedValueOnce([
        {
          id: "promo-free-ship",
          nameEn: "Complimentary Delivery Weekend",
          type: "FREE_SHIPPING",
          value: 0,
          minSpend: 250,
          maxDiscount: null,
          priority: 1,
          isStackable: true,
          isActive: true,
          startsAt: new Date(Date.now() - 86400000),
          endsAt: null,
          targetProductIds: [],
          targetCategoryIds: [],
          targetBrandIds: [],
          excludedProductIds: [],
        },
      ]);

      const quote = await PromotionService.evaluateCartPromotions({
        items: [{ productId: "p1", quantity: 1, price: 350 }],
      });

      expect(quote.freeShippingQualified).toBe(true);
    });
  });

  describe("2. Coupon Code Validation & Usage Restrictions", () => {
    it("validates a legitimate active coupon code", async () => {
      mockDb.coupon.findUnique.mockResolvedValueOnce({
        id: "cp-welcome15",
        code: "WELCOME15",
        type: "PERCENTAGE",
        value: 15,
        minSpend: 400,
        maxDiscount: 300,
        maxUses: 1000,
        usedCount: 42,
        maxUsesPerCustomer: 1,
        firstOrderOnly: false,
        isActive: true,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
        targetCustomerEmail: null,
        redemptions: [],
      });

      const verification = await PromotionService.verifyCoupon("WELCOME15", 500, "cust-01");
      expect(verification.valid).toBe(true);
      expect(verification.discountAmount).toBe(75); // 15% of 500
    });

    it("rejects an expired coupon code", async () => {
      mockDb.coupon.findUnique.mockResolvedValueOnce({
        id: "cp-expired",
        code: "BLACKFRIDAY",
        type: "PERCENTAGE",
        value: 30,
        isActive: true,
        startsAt: new Date(Date.now() - 86400000 * 30),
        expiresAt: new Date(Date.now() - 86400000), // Expired yesterday
        redemptions: [],
      });

      const verification = await PromotionService.verifyCoupon("BLACKFRIDAY", 1000);
      expect(verification.valid).toBe(false);
      expect(verification.reason).toContain("expired");
    });

    it("enforces first-order-only restriction when customer has prior completed orders", async () => {
      mockDb.coupon.findUnique.mockResolvedValueOnce({
        id: "cp-first10",
        code: "FIRST10",
        type: "PERCENTAGE",
        value: 10,
        firstOrderOnly: true,
        isActive: true,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: null,
        redemptions: [],
      });

      // Customer already has 2 delivered orders
      mockDb.order.count.mockResolvedValueOnce(2);

      const verification = await PromotionService.verifyCoupon("FIRST10", 600, "cust-returning");
      expect(verification.valid).toBe(false);
      expect(verification.reason).toContain("first order");
    });

    it("enforces total max uses exhaustion", async () => {
      mockDb.coupon.findUnique.mockResolvedValueOnce({
        id: "cp-limited",
        code: "EXCLUSIVE50",
        type: "FIXED_AMOUNT",
        value: 150,
        maxUses: 10,
        usedCount: 10, // fully used
        isActive: true,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: null,
        redemptions: [],
      });

      const verification = await PromotionService.verifyCoupon("EXCLUSIVE50", 1000);
      expect(verification.valid).toBe(false);
      expect(verification.reason).toContain("maximum usage");
    });
  });

  describe("3. Digital Gift Cards Engine", () => {
    it("generates a secure prefixed code format when creating a gift card", async () => {
      mockDb.giftCard.create.mockImplementationOnce(({ data }) => Promise.resolve({ id: "gc-new", ...data }));

      const card = await GiftCardService.createGiftCard({
        initialBalance: 1000,
        recipientEmail: "vip@muschio.ae",
        recipientName: "Fatima Al Mansoori",
      });

      expect(card.code).toMatch(/^MSC-GC-[A-Z0-9-]+$/);
      expect(card.balance).toBe(1000);
      expect(card.status).toBe("ACTIVE");
    });

    it("allows valid partial redemption and maintains accurate balance", async () => {
      mockDb.giftCard.findUnique.mockResolvedValueOnce({
        id: "gc-500",
        code: "MSC-GC-TEST-1234",
        balance: 500,
        status: "ACTIVE",
        expiresAt: null,
      });

      mockDb.giftCard.update.mockResolvedValueOnce({
        id: "gc-500",
        balance: 300,
        status: "ACTIVE",
      });

      const result = await GiftCardService.redeemGiftCard({
        code: "MSC-GC-TEST-1234",
        amountToDeduct: 200,
        orderId: "order-101",
      });

      expect(result.appliedAmount).toBe(200);
      expect(result.remainingBalance).toBe(300);
    });

    it("rejects redemption if requested deduction exceeds available balance", async () => {
      mockDb.giftCard.findUnique.mockResolvedValueOnce({
        id: "gc-low",
        code: "MSC-GC-LOW-0001",
        balance: 150,
        status: "ACTIVE",
        expiresAt: null,
      });

      await expect(
        GiftCardService.redeemGiftCard({
          code: "MSC-GC-LOW-0001",
          amountToDeduct: 500, // Exceeds 150
          orderId: "order-102",
        })
      ).rejects.toThrow(/Insufficient gift card balance/);
    });
  });

  describe("4. Loyalty Points, Tier Multipliers & Ledger Integrity", () => {
    it("dynamically evaluates correct tier based on points threshold", async () => {
      mockDb.loyaltyTier.findMany.mockResolvedValueOnce([
        {
          tier: "PRIVILEGE",
          nameEn: "Privilege Member",
          nameAr: "عضو بريفيلج",
          thresholdSpend: 0,
          multiplier: 1.0,
          benefitsEn: ["Standard earning"],
          benefitsAr: [],
        },
        {
          tier: "GOLD_SILLAGE",
          nameEn: "Gold Sillage",
          nameAr: "السيلّاج الذهبي",
          thresholdSpend: 2500,
          multiplier: 1.5,
          benefitsEn: ["1.5x multiplier"],
          benefitsAr: [],
        },
        {
          tier: "ROYAL_AMBASSADOR",
          nameEn: "Royal Ambassador",
          nameAr: "السفير الملكي",
          thresholdSpend: 6000,
          multiplier: 2.0,
          benefitsEn: ["2.0x multiplier"],
          benefitsAr: [],
        },
      ]);

      const privilege = await LoyaltyService.calculateTierForCustomer(1200);
      expect(privilege.tierKey).toBe("PRIVILEGE");
      expect(privilege.earningMultiplier).toBe(1.0);
      expect(privilege.nextTier?.tierKey).toBe("GOLD_SILLAGE");
      expect(privilege.nextTier?.pointsNeeded).toBe(1300);

      mockDb.loyaltyTier.findMany.mockResolvedValueOnce([
        { tier: "PRIVILEGE", thresholdSpend: 0, multiplier: 1.0 },
        { tier: "GOLD_SILLAGE", thresholdSpend: 2500, multiplier: 1.5 },
        { tier: "ROYAL_AMBASSADOR", thresholdSpend: 6000, multiplier: 2.0 },
      ]);

      const gold = await LoyaltyService.calculateTierForCustomer(3500);
      expect(gold.tierKey).toBe("GOLD_SILLAGE");
      expect(gold.earningMultiplier).toBe(1.5);
      expect(gold.nextTier?.tierKey).toBe("ROYAL_AMBASSADOR");
      expect(gold.nextTier?.pointsNeeded).toBe(2500);
    });

    it("awards welcome bonus on new customer registration", async () => {
      mockDb.loyaltyProgramConfig.findFirst.mockResolvedValueOnce({
        id: "default-config",
        welcomeBonusPoints: 100,
      });

      mockDb.customer.findUnique.mockResolvedValueOnce({
        id: "cust-new-01",
        email: "connoisseur@luxury.ae",
        loyaltyPoints: 0,
      });

      mockDb.customer.update.mockResolvedValueOnce({
        id: "cust-new-01",
        loyaltyPoints: 100,
      });

      const awarded = await LoyaltyService.awardWelcomeBonus("cust-new-01");
      expect(awarded).toBe(100);
      expect(mockDb.loyaltyTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: "cust-new-01",
            type: "WELCOME_BONUS",
            points: 100,
            balanceAfter: 100,
          }),
        })
      );
    });

    it("reverses order points on return inspection completion", async () => {
      mockDb.loyaltyTransaction.findMany.mockResolvedValueOnce([
        {
          id: "tx-earn-order",
          type: "EARN_PURCHASE",
          points: 250,
          customerId: "cust-return-1",
        },
      ]);

      mockDb.customer.findUnique.mockResolvedValueOnce({
        id: "cust-return-1",
        loyaltyPoints: 400,
      });

      mockDb.customer.update.mockResolvedValueOnce({
        id: "cust-return-1",
        loyaltyPoints: 150, // 400 - 250
      });

      const reversal = await LoyaltyService.reverseOrderPoints("order-ret-001");
      expect(reversal.reversedPoints).toBe(250);
      expect(reversal.newBalance).toBe(150);
      expect(mockDb.loyaltyTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "REFUND",
            points: -250,
            balanceAfter: 150,
          }),
        })
      );
    });

    it("requires mandatory audit reason for manual point adjustments", async () => {
      await expect(
        LoyaltyService.manualAdjustment("cust-audit-1", 500, "   ", "admin-01")
      ).rejects.toThrow(/mandatory.*reason/i);
    });

    it("successfully logs manual adjustment with admin audit trail", async () => {
      mockDb.customer.findUnique.mockResolvedValueOnce({
        id: "cust-vip-goodwill",
        loyaltyPoints: 500,
      });

      mockDb.customer.update.mockResolvedValueOnce({
        id: "cust-vip-goodwill",
        loyaltyPoints: 750,
      });

      const adj = await LoyaltyService.manualAdjustment(
        "cust-vip-goodwill",
        250,
        "Goodwill gesture for courier transit delay on bespoke extrait",
        "admin-vip-lead"
      );

      expect(adj.newBalance).toBe(750);
      expect(mockDb.loyaltyTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "MANUAL_ADJUSTMENT",
            points: 250,
            balanceAfter: 750,
            adminUserId: "admin-vip-lead",
            reason: "Goodwill gesture for courier transit delay on bespoke extrait",
          }),
        })
      );
    });
  });
});
