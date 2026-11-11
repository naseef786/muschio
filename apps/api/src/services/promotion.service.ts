import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import { Prisma } from "@prisma/client";
import { LoyaltyService } from "./loyalty.service";

export interface CartEvaluationItem {
  variantId: string;
  productId: string;
  brandId?: string;
  price: number;
  quantity: number;
}

export class PromotionService {
  /**
   * Admin creates a promotion
   */
  static async createPromotion(data: any, adminUserId?: string) {
    if (!data.nameEn || !data.nameEn.trim()) {
      throw new ApiError(400, "NAME_REQUIRED", "Promotion English name is required");
    }

    const promotion = await prisma.promotion.create({
      data: {
        nameEn: data.nameEn.trim(),
        nameAr: data.nameAr?.trim() || null,
        descriptionEn: data.descriptionEn?.trim() || null,
        descriptionAr: data.descriptionAr?.trim() || null,
        type: data.type || "PERCENTAGE",
        value: new Prisma.Decimal(data.value || 0),
        isAutomatic: Boolean(data.isAutomatic),
        priority: Number(data.priority || 0),
        stackable: Boolean(data.stackable),
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        minOrderAmount: data.minOrderAmount ? new Prisma.Decimal(data.minOrderAmount) : null,
        maxDiscountAmount: data.maxDiscountAmount ? new Prisma.Decimal(data.maxDiscountAmount) : null,
        customerUsageLimit: data.customerUsageLimit ? Number(data.customerUsageLimit) : null,
        totalUsageLimit: data.totalUsageLimit ? Number(data.totalUsageLimit) : null,
        applicableProductIds: data.applicableProductIds || [],
        applicableBrandIds: data.applicableBrandIds || [],
        applicableCategories: data.applicableCategories || [],
        excludedProductIds: data.excludedProductIds || [],
        firstOrderOnly: Boolean(data.firstOrderOnly),
        targetTier: data.targetTier || null,
      },
    });

    if (adminUserId) {
      await prisma.auditLog.create({
        data: {
          adminUserId,
          action: "CREATE_PROMOTION",
          resourceType: "PROMOTION",
          resourceId: promotion.id,
          diff: { promotion },
        },
      });
    }

    return promotion;
  }

  /**
   * Admin updates a promotion
   */
  static async updatePromotion(id: string, data: any, adminUserId?: string) {
    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Promotion not found");

    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        nameEn: data.nameEn !== undefined ? data.nameEn.trim() : existing.nameEn,
        nameAr: data.nameAr !== undefined ? data.nameAr?.trim() : existing.nameAr,
        descriptionEn: data.descriptionEn !== undefined ? data.descriptionEn?.trim() : existing.descriptionEn,
        descriptionAr: data.descriptionAr !== undefined ? data.descriptionAr?.trim() : existing.descriptionAr,
        type: data.type || existing.type,
        value: data.value !== undefined ? new Prisma.Decimal(data.value) : existing.value,
        isAutomatic: data.isAutomatic !== undefined ? Boolean(data.isAutomatic) : existing.isAutomatic,
        priority: data.priority !== undefined ? Number(data.priority) : existing.priority,
        stackable: data.stackable !== undefined ? Boolean(data.stackable) : existing.stackable,
        startsAt: data.startsAt !== undefined ? (data.startsAt ? new Date(data.startsAt) : null) : existing.startsAt,
        endsAt: data.endsAt !== undefined ? (data.endsAt ? new Date(data.endsAt) : null) : existing.endsAt,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
        minOrderAmount: data.minOrderAmount !== undefined ? (data.minOrderAmount ? new Prisma.Decimal(data.minOrderAmount) : null) : existing.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount !== undefined ? (data.maxDiscountAmount ? new Prisma.Decimal(data.maxDiscountAmount) : null) : existing.maxDiscountAmount,
        customerUsageLimit: data.customerUsageLimit !== undefined ? (data.customerUsageLimit ? Number(data.customerUsageLimit) : null) : existing.customerUsageLimit,
        totalUsageLimit: data.totalUsageLimit !== undefined ? (data.totalUsageLimit ? Number(data.totalUsageLimit) : null) : existing.totalUsageLimit,
        applicableProductIds: data.applicableProductIds !== undefined ? data.applicableProductIds : existing.applicableProductIds,
        applicableBrandIds: data.applicableBrandIds !== undefined ? data.applicableBrandIds : existing.applicableBrandIds,
        applicableCategories: data.applicableCategories !== undefined ? data.applicableCategories : existing.applicableCategories,
        excludedProductIds: data.excludedProductIds !== undefined ? data.excludedProductIds : existing.excludedProductIds,
        firstOrderOnly: data.firstOrderOnly !== undefined ? Boolean(data.firstOrderOnly) : existing.firstOrderOnly,
        targetTier: data.targetTier !== undefined ? data.targetTier : existing.targetTier,
      },
    });

    if (adminUserId) {
      await prisma.auditLog.create({
        data: {
          adminUserId,
          action: "UPDATE_PROMOTION",
          resourceType: "PROMOTION",
          resourceId: updated.id,
          diff: { previous: existing, updated },
        },
      });
    }

    return updated;
  }

  /**
   * Admin deletes a promotion
   */
  static async deletePromotion(id: string, adminUserId?: string) {
    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Promotion not found");

    await prisma.promotion.delete({ where: { id } });

    if (adminUserId) {
      await prisma.auditLog.create({
        data: {
          adminUserId,
          action: "DELETE_PROMOTION",
          resourceType: "PROMOTION",
          resourceId: id,
          diff: { deleted: existing },
        },
      });
    }

    return { success: true, deleted: id };
  }

  /**
   * List promotions with filters
   */
  static async listPromotions(filter?: { isActive?: boolean; isAutomatic?: boolean }) {
    return prisma.promotion.findMany({
      where: {
        ...(filter?.isActive !== undefined ? { isActive: filter.isActive } : {}),
        ...(filter?.isAutomatic !== undefined ? { isAutomatic: filter.isAutomatic } : {}),
      },
      include: {
        coupons: true,
        _count: { select: { redemptions: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Admin creates a Coupon Code linked to a promotion
   */
  static async createCoupon(data: {
    code: string;
    promotionId: string;
    assignedCustomerId?: string;
    maxUses?: number;
    expiresAt?: string | Date;
  }, adminUserId?: string) {
    const code = data.code.trim().toUpperCase();
    if (!code) throw new ApiError(400, "CODE_REQUIRED", "Coupon code is required");

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ApiError(409, "DUPLICATE_CODE", "Coupon code already exists");

    const promotion = await prisma.promotion.findUnique({ where: { id: data.promotionId } });
    if (!promotion) throw new ApiError(404, "PROMOTION_NOT_FOUND", "Linked promotion not found");

    const coupon = await prisma.coupon.create({
      data: {
        code,
        promotionId: promotion.id,
        assignedCustomerId: data.assignedCustomerId || null,
        maxUses: data.maxUses ? Number(data.maxUses) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: true,
      },
      include: { promotion: true },
    });

    if (adminUserId) {
      await prisma.auditLog.create({
        data: {
          adminUserId,
          action: "CREATE_COUPON",
          resourceType: "COUPON",
          resourceId: coupon.id,
          diff: { coupon },
        },
      });
    }

    return coupon;
  }

  /**
   * Admin lists all coupons
   */
  static async listCoupons(filter?: { isActive?: boolean }) {
    return prisma.coupon.findMany({
      where: {
        ...(filter?.isActive !== undefined ? { isActive: filter.isActive } : {}),
      },
      include: {
        promotion: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Admin deletes a coupon
   */
  static async deleteCoupon(id: string, adminUserId?: string) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Coupon not found");

    await prisma.coupon.delete({ where: { id } });

    if (adminUserId) {
      await prisma.auditLog.create({
        data: {
          adminUserId,
          action: "DELETE_COUPON",
          resourceType: "COUPON",
          resourceId: id,
          diff: { deleted: existing },
        },
      });
    }

    return { success: true, deleted: id };
  }

  /**
   * Verify Coupon or Voucher Code
   */
  static async verifyCoupon(code: string, cartTotal?: number, customerId?: string) {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) return { valid: false, reason: "Coupon code is required" };

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
      include: { promotion: true },
    });

    if (!coupon) {
      // Fallback: Check VIP Voucher
      const voucher = await prisma.voucher.findUnique({
        where: { code: cleanCode },
        include: { redemptions: true },
      });
      if (voucher) {
        if (voucher.redemptions && voucher.redemptions.length > 0) return { valid: false, reason: "Voucher already redeemed" };
        if (voucher.expiresAt && voucher.expiresAt < new Date()) {
          return { valid: false, reason: "Voucher has expired" };
        }
        return {
          valid: true,
          code: voucher.code,
          discountAmount: voucher.discountAmount ? Number(voucher.discountAmount) : null,
          discountPercent: voucher.discountPercent ? Number(voucher.discountPercent) : null,
          isDiscoveryVoucher: voucher.isDiscoveryVoucher,
        };
      }
      return { valid: false, reason: "Coupon code not found" };
    }

    const now = new Date();
    if (!coupon.isActive || (coupon.promotion && !coupon.promotion.isActive)) {
      return { valid: false, reason: "Coupon is inactive" };
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { valid: false, reason: "Coupon has expired" };
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, reason: "Coupon has reached maximum usage limit" };
    }
    const isFirstOnly = coupon.promotion?.firstOrderOnly ?? (coupon as any).firstOrderOnly;
    if (isFirstOnly && customerId) {
      const priorOrders = await prisma.order.count({
        where: { customerId, status: { not: "CANCELLED" } },
      });
      if (priorOrders > 0) {
        return { valid: false, reason: "This coupon is valid for first order only" };
      }
    }
    const minSpend = coupon.promotion?.minOrderAmount ?? (coupon.promotion as any)?.minSpend;
    if (minSpend && cartTotal !== undefined) {
      if (new Prisma.Decimal(cartTotal).lessThan(minSpend)) {
        return {
          valid: false,
          reason: `Minimum order amount of AED ${minSpend} required`,
        };
      }
    }

    let discountAmount: number | null = null;
    let discountPercent: number | null = null;
    const pType = coupon.promotion?.type ?? (coupon as any).type;
    const pVal = coupon.promotion?.value ?? (coupon as any).value ?? 0;

    if (pType === "FIXED_AMOUNT") {
      discountAmount = Number(pVal);
    } else if (pType === "PERCENTAGE") {
      discountPercent = Number(pVal);
      if (cartTotal !== undefined) {
        discountAmount = Math.round((cartTotal * discountPercent) / 100);
      }
    }

    const maxCap = coupon.promotion?.maxDiscountAmount ?? (coupon.promotion as any)?.maxDiscount;
    if (maxCap && discountAmount) {
      discountAmount = Math.min(discountAmount, Number(maxCap));
    }

    return {
      valid: true,
      code: coupon.code,
      type: pType,
      discountAmount,
      discountPercent,
      minOrderAmount: minSpend ? Number(minSpend) : null,
    };
  }

  /**
   * Centralized Evaluation Engine:
   * Evaluates Cart Items, Subtotal, Customer Eligibility, Automatic Promotions, and optional Coupon
   */
  static async evaluateCartPromotions(
    cartItemsOrPayload: CartEvaluationItem[] | { items: CartEvaluationItem[]; subtotal?: number; customerId?: string; couponCode?: string },
    subtotalParam?: number,
    customerIdParam?: string,
    couponCodeParam?: string,
  ) {
    const now = new Date();
    let cartItems: CartEvaluationItem[];
    let subtotal: number;
    let customerId: string | undefined = customerIdParam;
    let couponCode: string | undefined = couponCodeParam;

    if (Array.isArray(cartItemsOrPayload)) {
      cartItems = cartItemsOrPayload;
      subtotal = typeof subtotalParam === "number"
        ? subtotalParam
        : cartItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    } else {
      cartItems = cartItemsOrPayload.items || [];
      subtotal = typeof cartItemsOrPayload.subtotal === "number"
        ? cartItemsOrPayload.subtotal
        : cartItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
      customerId = cartItemsOrPayload.customerId || customerIdParam;
      couponCode = cartItemsOrPayload.couponCode || couponCodeParam;
    }

    let totalDiscount = 0;
    let automaticDiscount = 0;
    let freeShippingQualified = false;
    const appliedDiscounts: Array<{
      id: string;
      code?: string;
      nameEn: string;
      nameAr?: string | null;
      discountAmount: number;
      type: string;
    }> = [];

    // Check if customer is first-time purchaser
    let isFirstOrder = true;
    if (customerId) {
      const orderCount = await prisma.order.count({
        where: { customerId, status: { not: "CANCELLED" } },
      });
      if (orderCount > 0) isFirstOrder = false;
    }

    // 1. Evaluate Coupon Code if provided
    if (couponCode && couponCode.trim()) {
      const code = couponCode.trim().toUpperCase();

      // Check modern Coupon model first
      const coupon = await prisma.coupon.findUnique({
        where: { code },
        include: { promotion: true },
      });

      if (coupon) {
        if (!coupon.isActive || !coupon.promotion.isActive) {
          throw new ApiError(400, "COUPON_INACTIVE", "Coupon is inactive or paused");
        }
        if (coupon.expiresAt && coupon.expiresAt < now) {
          throw new ApiError(400, "COUPON_EXPIRED", "Coupon has expired");
        }
        if (coupon.promotion.startsAt && coupon.promotion.startsAt > now) {
          throw new ApiError(400, "COUPON_NOT_STARTED", "Promotion has not started yet");
        }
        if (coupon.promotion.endsAt && coupon.promotion.endsAt < now) {
          throw new ApiError(400, "COUPON_EXPIRED", "Promotion campaign has ended");
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw new ApiError(400, "COUPON_DEPLETED", "Coupon usage limit reached");
        }
        if (coupon.promotion.totalUsageLimit && coupon.promotion.usageCount >= coupon.promotion.totalUsageLimit) {
          throw new ApiError(400, "PROMOTION_DEPLETED", "Promotion redemption limit reached");
        }
        if (coupon.assignedCustomerId && coupon.assignedCustomerId !== customerId) {
          throw new ApiError(403, "COUPON_RESTRICTED", "This coupon is private to another client account");
        }
        if (coupon.promotion.firstOrderOnly && !isFirstOrder) {
          throw new ApiError(400, "FIRST_ORDER_ONLY", "Coupon is valid for first-time clients only");
        }
        if (coupon.promotion.minOrderAmount && new Prisma.Decimal(subtotal).lessThan(coupon.promotion.minOrderAmount)) {
          throw new ApiError(
            400,
            "MIN_ORDER_NOT_MET",
            `Minimum order of ${coupon.promotion.minOrderAmount} AED is required for this coupon`,
          );
        }

        // Check per-customer limit
        if (customerId && coupon.promotion.customerUsageLimit) {
          const customerUses = await prisma.promotionRedemption.count({
            where: { promotionId: coupon.promotion.id, customerId },
          });
          if (customerUses >= coupon.promotion.customerUsageLimit) {
            throw new ApiError(400, "CUSTOMER_LIMIT_REACHED", "You have already reached the redemption limit for this promotion");
          }
        }

        // Calculate discount
        let discount = 0;
        if (coupon.promotion.type === "PERCENTAGE") {
          discount = (subtotal * Number(coupon.promotion.value)) / 100;
        } else if (coupon.promotion.type === "FIXED_AMOUNT") {
          discount = Math.min(subtotal, Number(coupon.promotion.value));
        }

        // Apply maximum discount cap if set
        if (coupon.promotion.maxDiscountAmount) {
          discount = Math.min(discount, Number(coupon.promotion.maxDiscountAmount));
        }

        if (discount > 0) {
          totalDiscount += discount;
          appliedDiscounts.push({
            id: coupon.promotion.id,
            code: coupon.code,
            nameEn: coupon.promotion.nameEn,
            nameAr: coupon.promotion.nameAr,
            discountAmount: Math.round(discount * 100) / 100,
            type: coupon.promotion.type,
          });
        }
      } else {
        // Fallback: Check legacy Voucher model (for Discovery Sets & existing vouchers)
        const voucher = await prisma.voucher.findUnique({
          where: { code },
          include: { redemptions: true },
        });

        if (!voucher) {
          throw new ApiError(404, "INVALID_PROMO_CODE", "Promotion or voucher code not found");
        }
        if (voucher.expiresAt && voucher.expiresAt < now) {
          throw new ApiError(400, "VOUCHER_EXPIRED", "This voucher code has expired");
        }
        if (voucher.redemptions && voucher.redemptions.length > 0) {
          throw new ApiError(400, "VOUCHER_USED", "This voucher code has already been redeemed");
        }

        let discount = 0;
        if (voucher.discountPercent) {
          discount = (subtotal * Number(voucher.discountPercent)) / 100;
        } else if (voucher.discountAmount) {
          discount = Math.min(subtotal, Number(voucher.discountAmount));
        }

        if (discount > 0) {
          totalDiscount += discount;
          appliedDiscounts.push({
            id: voucher.id,
            code: voucher.code,
            nameEn: voucher.isDiscoveryVoucher ? "Discovery Set Full Refund Voucher" : "Private Voucher",
            nameAr: voucher.isDiscoveryVoucher ? "قسيمة استرداد مجموعة العينات" : "قسيمة خاصة",
            discountAmount: Math.round(discount * 100) / 100,
            type: "VOUCHER",
          });
        }
      }
    }

    // 2. Evaluate Automatic Promotions (if no exclusive coupon applied or if stackable)
    if (appliedDiscounts.length === 0) {
      const automaticPromotions = await prisma.promotion.findMany({
        where: {
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
        },
        orderBy: { priority: "desc" },
      });

      for (const promo of automaticPromotions) {
        if (promo.firstOrderOnly && !isFirstOrder) continue;
        const minSpend = promo.minOrderAmount ?? (promo as any).minSpend;
        if (minSpend && new Prisma.Decimal(subtotal).lessThan(minSpend)) continue;

        let discount = 0;
        if (promo.type === "PERCENTAGE") {
          discount = (subtotal * Number(promo.value)) / 100;
        } else if (promo.type === "FIXED_AMOUNT") {
          discount = Math.min(subtotal, Number(promo.value));
        } else if (promo.type === "FREE_SHIPPING") {
          freeShippingQualified = true;
        }

        const maxCap = promo.maxDiscountAmount ?? (promo as any).maxDiscount;
        if (maxCap && discount > 0) {
          discount = Math.min(discount, Number(maxCap));
        }

        if (discount > 0 || promo.type === "FREE_SHIPPING") {
          totalDiscount += discount;
          automaticDiscount += discount;
          appliedDiscounts.push({
            id: promo.id,
            nameEn: promo.nameEn,
            nameAr: promo.nameAr,
            discountAmount: Math.round(discount * 100) / 100,
            type: promo.type,
          });

          // Non-stackable automatic promotions take the highest priority one and stop
          const isStackable = promo.stackable ?? (promo as any).isStackable;
          if (!isStackable) break;
        }
      }
    }

    return {
      originalSubtotal: subtotal,
      subtotal,
      totalDiscount: Math.min(subtotal, Math.round(totalDiscount * 100) / 100),
      automaticDiscountTotal: Math.round(automaticDiscount * 100) / 100,
      payableSubtotal: Math.max(0, subtotal - totalDiscount),
      finalTotal: Math.max(0, subtotal - totalDiscount),
      appliedDiscounts,
      appliedPromotions: appliedDiscounts,
      freeShippingQualified,
    };
  }

  /**
   * Records redemptions atomically upon verified order completion
   */
  static async recordRedemptions(
    orderId: string,
    customerId: string | null,
    appliedDiscounts: Array<{ id: string; code?: string; discountAmount: number }>,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || prisma;

    for (const item of appliedDiscounts) {
      if (item.code) {
        // Increment usage count on coupon and promotion if coupon
        const coupon = await client.coupon.findUnique({
          where: { code: item.code },
          include: { promotion: true },
        });

        if (coupon) {
          await client.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });

          await client.promotion.update({
            where: { id: coupon.promotionId },
            data: { usageCount: { increment: 1 } },
          });

          await client.promotionRedemption.create({
            data: {
              promotionId: coupon.promotionId,
              couponId: coupon.id,
              orderId,
              customerId,
              discountAmount: new Prisma.Decimal(item.discountAmount),
            },
          });
        } else {
          // Record legacy voucher redemption
          const voucher = await client.voucher.findUnique({ where: { code: item.code } });
          if (voucher) {
            await client.voucherRedemption.create({
              data: {
                voucherId: voucher.id,
                orderId,
              },
            });
          }
        }
      } else {
        // Automatic promotion redemption
        await client.promotion.update({
          where: { id: item.id },
          data: { usageCount: { increment: 1 } },
        });

        await client.promotionRedemption.create({
          data: {
            promotionId: item.id,
            orderId,
            customerId,
            discountAmount: new Prisma.Decimal(item.discountAmount),
          },
        });
      }
    }
  }

  /**
   * Real KPIs for Admin Promotions Dashboard
   */
  static async getPromotionsDashboardMetrics() {
    const [
      activePromotionsCount,
      activeCouponsCount,
      redemptionsAggregate,
      vouchers,
      giftCards,
      loyaltyConfig,
      customersWithPoints,
    ] = await Promise.all([
      prisma.promotion.count({ where: { isActive: true } }),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.promotionRedemption.aggregate({
        _sum: { discountAmount: true },
        _count: { id: true },
      }),
      prisma.voucher.findMany({
        where: { redemptions: { none: {} } },
      }),
      prisma.giftCard.findMany({
        where: { status: "ACTIVE" },
      }),
      LoyaltyService.getProgramConfig(),
      prisma.customer.aggregate({
        _sum: { loyaltyPoints: true },
      }),
    ]);

    // Calculate real outstanding voucher liability
    let voucherLiability = 0;
    for (const v of vouchers) {
      if (v.discountAmount) {
        voucherLiability += Number(v.discountAmount);
      }
    }

    // Calculate real outstanding gift card liability
    let giftCardLiability = 0;
    for (const gc of giftCards) {
      giftCardLiability += Number(gc.remainingBalance);
    }

    // Calculate real loyalty liability
    const totalPoints = customersWithPoints._sum.loyaltyPoints || 0;
    const rate = loyaltyConfig.pointsRedemptionRate || 10;
    const loyaltyAedLiability = Math.floor(totalPoints / rate);

    const recentRedemptions = await prisma.promotionRedemption.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        promotion: { select: { nameEn: true, nameAr: true } },
        coupon: { select: { code: true } },
      },
    });

    return {
      activePromotionsCount,
      activeCouponsCount,
      totalRedemptionsCount: redemptionsAggregate._count.id || 0,
      totalDiscountsGrantedAed: Number(redemptionsAggregate._sum.discountAmount || 0),
      outstandingVoucherLiabilityAed: voucherLiability,
      outstandingGiftCardLiabilityAed: giftCardLiability,
      totalOutstandingLoyaltyPoints: totalPoints,
      outstandingLoyaltyLiabilityAed: loyaltyAedLiability,
      recentRedemptions: recentRedemptions.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        promotionName: r.promotion?.nameEn || "Promotion",
        couponCode: r.coupon?.code || null,
        discountAmount: Number(r.discountAmount),
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}
