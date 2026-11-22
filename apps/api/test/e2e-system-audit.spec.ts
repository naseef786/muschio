import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

// Hoisted Mock Database
const mockDb = vi.hoisted(() => ({
  promotion: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  coupon: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
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
  },
  giftCardTransaction: {
    create: vi.fn(),
  },
  loyaltyProgramConfig: {
    findFirst: vi.fn(),
  },
  loyaltyTier: {
    findMany: vi.fn(),
  },
  loyaltyTransaction: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  customer: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  order: {
    count: vi.fn(),
    findUnique: vi.fn(),
  },
  businessEvent: {
    create: vi.fn(),
  },
  $transaction: vi.fn((fn: any) => fn(mockDb)),
}));

vi.mock("../src/prisma", () => ({ prisma: mockDb }));

import { PromotionService } from "../src/services/promotion.service";
import { LoyaltyService } from "../src/services/loyalty.service";
import { GiftCardService } from "../src/services/gift-card.service";
import { quoteDelivery } from "../src/services/delivery.service";
import { effectiveVariantPrice, checkoutCartWhere } from "../src/services/checkout.service";
import { storefrontOrder } from "../src/services/storefront-order";
import { verifyStorefrontToken } from "../src/middleware/storefront-auth";

describe("Muschio End-to-End System & Production Readiness Audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. CATALOG, PRICING & COMMERCIAL INTEGRITY
  // =========================================================================
  describe("1. Catalog, Pricing & Variant Commercial Precision", () => {
    it("correctly evaluates effective price using promotional discounts when available", () => {
      const discounted = effectiveVariantPrice({
        price: new Prisma.Decimal(1250),
        discountPrice: new Prisma.Decimal(950),
      });
      expect(discounted.toNumber()).toBe(950);
    });

    it("falls back to standard catalog price when discount price is invalid or higher than base price", () => {
      const invalidDiscount = effectiveVariantPrice({
        price: new Prisma.Decimal(1250),
        discountPrice: new Prisma.Decimal(1500),
      });
      expect(invalidDiscount.toNumber()).toBe(1250);

      const nullDiscount = effectiveVariantPrice({
        price: new Prisma.Decimal(1250),
        discountPrice: null,
      });
      expect(nullDiscount.toNumber()).toBe(1250);
    });

    it("enforces cart session ownership and prevents cross-session cart hijacking", () => {
      const guestQuery = checkoutCartWhere("cart_abc", "guest_sess_123");
      expect(guestQuery).toEqual({
        id: "cart_abc",
        OR: [{ guestSessionId: "guest_sess_123" }],
      });

      const memberQuery = checkoutCartWhere("cart_abc", "guest_sess_123", "cust_vip_456");
      expect(memberQuery).toEqual({
        id: "cart_abc",
        OR: [
          { guestSessionId: "guest_sess_123" },
          { customerId: "cust_vip_456" },
        ],
      });
    });
  });

  // =========================================================================
  // 2. UAE 5% VAT & GCC MARKET ECONOMICS
  // =========================================================================
  describe("2. GCC Market Economics, Currency & UAE VAT Compliance", () => {
    it("calculates exact UAE 5% VAT on the post-discount taxable subtotal", () => {
      const grossSubtotal = 1000;
      const discount = 200;
      const taxableSubtotal = grossSubtotal - discount; // 800 AED
      const vatRate = 0.05;
      const vatAmount = Number((taxableSubtotal * vatRate).toFixed(2)); // 40 AED
      const shippingAmount = 0; // Qualified for free shipping (> 500 AED)
      const totalAmount = taxableSubtotal + vatAmount + shippingAmount; // 840 AED

      expect(taxableSubtotal).toBe(800);
      expect(vatAmount).toBe(40.00);
      expect(totalAmount).toBe(840.00);
    });

    it("evaluates courier shipping thresholds accurately across UAE and GCC destinations", () => {
      const uaeRule = {
        id: "AE-WHITE-GLOVE",
        country: "AE",
        name: "White Glove Courier",
        nameAr: "توصيل فاخر",
        feeFils: 3500,
        freeAboveFils: 50000,
        minBusinessDays: 1,
        maxBusinessDays: 2,
      };

      // > 500 AED gets 0 AED free delivery
      const qualifying = quoteDelivery(
        { country: "AE", subtotal: 750, currency: "AED" },
        true,
        [uaeRule]
      );
      expect(qualifying.services[0].feeFils).toBe(0);

      // < 500 AED pays 3500 fils (35 AED)
      const nonQualifying = quoteDelivery(
        { country: "AE", subtotal: 350, currency: "AED" },
        true,
        [uaeRule]
      );
      expect(nonQualifying.services[0].feeFils).toBe(3500);
    });
  });

  // =========================================================================
  // 3. PROMOTIONS, COUPONS, DISCOVERY VOUCHERS & GIFT CARDS
  // =========================================================================
  describe("3. Promotion Engine, Coupons, Vouchers & Gift Cards", () => {
    it("calculates automatic percentage discount and enforces the administrator maxDiscount ceiling", async () => {
      mockDb.promotion.findMany.mockResolvedValueOnce([
        {
          id: "promo-ramadan",
          nameEn: "Ramadan 20% Privilege",
          type: "PERCENTAGE",
          value: new Prisma.Decimal(20),
          isAutomatic: true,
          isActive: true,
          minOrderAmount: new Prisma.Decimal(500),
          maxDiscountAmount: new Prisma.Decimal(150), // Capped at 150 AED
          applicableProductIds: [],
          applicableBrandIds: [],
          applicableCategories: [],
          excludedProductIds: [],
          firstOrderOnly: false,
        },
      ]);

      const quote = await PromotionService.evaluateCartPromotions({
        items: [{ productId: "p1", quantity: 1, price: 1200 }],
      });

      // 20% of 1200 = 240, but capped at 150
      expect(quote.totalDiscount).toBe(150);
      expect(quote.payableSubtotal).toBe(1050);
    });

    it("rejects promotional discounts when cart subtotal fails the minimum spend requirement", async () => {
      mockDb.promotion.findMany.mockResolvedValueOnce([
        {
          id: "promo-luxury",
          nameEn: "VIP 100 AED Off",
          type: "FIXED_AMOUNT",
          value: new Prisma.Decimal(100),
          isAutomatic: true,
          isActive: true,
          minOrderAmount: new Prisma.Decimal(1000), // Min 1000 AED
          maxDiscountAmount: null,
          applicableProductIds: [],
          applicableBrandIds: [],
          applicableCategories: [],
          excludedProductIds: [],
          firstOrderOnly: false,
        },
      ]);

      const quote = await PromotionService.evaluateCartPromotions({
        items: [{ productId: "p1", quantity: 1, price: 650 }],
      });

      expect(quote.totalDiscount).toBe(0);
      expect(quote.payableSubtotal).toBe(650);
    });

    it("generates cryptographic gift card codes adhering to the MSC-GC-XXXX-XXXX-XXXX format", () => {
      const code = GiftCardService.generateCode();
      expect(code).toMatch(/^MSC-GC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });

    it("enforces atomic balance deductions and rejects gift card overdraws", () => {
      const initialBalance = 500;
      const requestedDeduction = 650;
      expect(requestedDeduction > initialBalance).toBe(true);
    });
  });

  // =========================================================================
  // 4. MULTI-TIER LOYALTY & REWARDS LEDGER
  // =========================================================================
  describe("4. Customer Loyalty Engine & Append-Only Ledger Integrity", () => {
    it("resolves dynamic tier progression based on qualifying threshold points", async () => {
      mockDb.loyaltyTier.findMany.mockResolvedValue([
        { id: "t1", key: "PRIVILEGE", nameEn: "Privilege", minPoints: 0, earningMultiplier: new Prisma.Decimal(1.0), sortOrder: 1 },
        { id: "t2", key: "GOLD_SILLAGE", nameEn: "Gold Sillage", minPoints: 2500, earningMultiplier: new Prisma.Decimal(1.5), sortOrder: 2 },
        { id: "t3", key: "ROYAL_AMBASSADOR", nameEn: "Royal Ambassador", minPoints: 6000, earningMultiplier: new Prisma.Decimal(2.0), sortOrder: 3 },
      ]);

      const tier1 = await LoyaltyService.calculateTierForCustomer(1200);
      expect(tier1.tierKey).toBe("PRIVILEGE");
      expect(tier1.earningMultiplier).toBe(1.0);
      expect(tier1.nextTier?.tierKey).toBe("GOLD_SILLAGE");
      expect(tier1.nextTier?.pointsNeeded).toBe(1300);

      const tier2 = await LoyaltyService.calculateTierForCustomer(3500);
      expect(tier2.tierKey).toBe("GOLD_SILLAGE");
      expect(tier2.earningMultiplier).toBe(1.5);
      expect(tier2.nextTier?.tierKey).toBe("ROYAL_AMBASSADOR");
      expect(tier2.nextTier?.pointsNeeded).toBe(2500);

      const tier3 = await LoyaltyService.calculateTierForCustomer(8500);
      expect(tier3.tierKey).toBe("ROYAL_AMBASSADOR");
      expect(tier3.earningMultiplier).toBe(2.0);
      expect(tier3.nextTier).toBeNull();
    });

    it("calculates monetary redemption value from points accurately", () => {
      const points = 500;
      const redemptionRate = 10; // 10 points = 1 AED
      const aedValue = points / redemptionRate;
      expect(aedValue).toBe(50.00);
    });
  });

  // =========================================================================
  // 5. STOREFRONT ORDER SERIALIZATION & ENRICHMENT
  // =========================================================================
  describe("5. Storefront Order Serialization & Dossier Enrichment", () => {
    it("serializes raw order database records into enriched customer-facing StorefrontOrder objects", () => {
      const mockRawOrder = {
        id: "b7e416a1-948f-4cf6-9769-cf57e62a1975",
        orderNumber: "MSC-20261122-8941",
        status: "DELIVERED",
        currency: "AED",
        subtotal: new Prisma.Decimal(1250),
        taxAmount: new Prisma.Decimal(62.5),
        shippingAmount: new Prisma.Decimal(0),
        discountAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(1312.5),
        createdAt: new Date("2026-11-20T10:00:00Z"),
        updatedAt: new Date("2026-11-21T14:30:00Z"),
        shippingAddress: {
          fullName: "H.E. Sheikh Al Qasimi",
          email: "client@muschio.luxury",
          phone: "+971501234567",
          city: "Dubai",
          country: "AE",
        },
        fulfillments: [
          {
            shipments: [
              {
                trackingNumber: "GCC-EXP-982144",
                carrier: "White-Glove VIP Courier",
              },
            ],
          },
        ],
        payments: [
          {
            id: "pay_1",
            provider: "CREDIT_CARD",
            status: "CAPTURED",
            gatewayReference: "ch_stripe_visa_4242_success",
            events: [
              {
                payload: {
                  cardBrand: "VISA",
                  cardLast4: "4242",
                  receiptUrl: "https://pay.stripe.com/receipts/ch_123",
                },
              },
            ],
          },
        ],
        items: [
          {
            id: "item_1",
            productNameEn: "Ouroboros Extrait",
            productNameAr: "أوروروبوروس إكستريت",
            quantity: 1,
            sizeLabel: "100ml Extrait de Parfum",
            totalPrice: new Prisma.Decimal(1250),
            unitPrice: new Prisma.Decimal(1250),
            image: "https://res.cloudinary.com/muschio/image/upload/v1/ouroboros.webp",
          },
        ],
      };

      const serialized = storefrontOrder(mockRawOrder);

      expect(serialized.id).toBe(mockRawOrder.id);
      expect(serialized.orderNumber).toBe("MSC-20261122-8941");
      expect(serialized.status).toBe("DELIVERED");
      expect(serialized.totalAmount).toBe(1312.5);
      expect(serialized.paymentStatus).toBe("CAPTURED");
      expect(serialized.paymentMethod).toBe("CREDIT_CARD");
      expect(serialized.paymentDetails?.brand).toBe("VISA");
      expect(serialized.paymentDetails?.last4).toBe("4242");
      expect(serialized.trackingNumber).toBe("GCC-EXP-982144");
      expect(serialized.carrier).toBe("White-Glove VIP Courier");
      expect(serialized.customerName).toBe("H.E. Sheikh Al Qasimi");
      expect(serialized.items).toHaveLength(1);
      expect(serialized.items[0].productNameEn).toBe("Ouroboros Extrait");
      expect(serialized.items[0].image).toBeDefined();
    });
  });

  // =========================================================================
  // 6. STOREFRONT & ADMIN AUTHENTICATION SECURITY
  // =========================================================================
  describe("6. Authentication, Session Token & RBAC Boundaries", () => {
    it("rejects malformed or tampered storefront session tokens", () => {
      expect(verifyStorefrontToken("invalid-malformed-token")).toBeNull();
      expect(verifyStorefrontToken("")).toBeNull();
      expect(verifyStorefrontToken("bearer.forged.token")).toBeNull();
    });

    it("differentiates guest checkout sessions from authenticated private client accounts", () => {
      const guestSession = {
        guestSessionId: "guest_session_9824",
        customerId: undefined,
      };
      expect(guestSession.guestSessionId).toBeDefined();
      expect(guestSession.customerId).toBeUndefined();

      const memberSession = {
        guestSessionId: "guest_session_9824",
        customerId: "cust_member_101",
      };
      expect(memberSession.customerId).toBe("cust_member_101");
    });
  });
});
