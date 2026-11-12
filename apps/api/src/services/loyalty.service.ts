import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import { Prisma } from "@prisma/client";

export class LoyaltyService {
  /**
   * Retrieves current dynamic loyalty configuration from database
   */
  static async getProgramConfig() {
    let config = await prisma.loyaltyProgramConfig.findFirst();
    if (!config) {
      config = await prisma.loyaltyProgramConfig.create({
        data: {
          id: "default-loyalty-config",
          isEnabled: true,
          programNameEn: "Muschio Privilege",
          programNameAr: "مسكيو بريفيلج",
          pointsPerAedSpent: new Prisma.Decimal(1.0),
          pointsRedemptionRate: 10,
          welcomeBonusPoints: 100,
          minRedemptionPoints: 100,
          awardOnPaymentCapture: true,
        },
      });
    }
    return config;
  }

  /**
   * Admin updates global loyalty rules
   */
  static async updateProgramConfig(data: any, adminUserId?: string) {
    const existing = await this.getProgramConfig();
    const updated = await prisma.loyaltyProgramConfig.update({
      where: { id: existing.id },
      data: {
        isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : existing.isEnabled,
        programNameEn: data.programNameEn || existing.programNameEn,
        programNameAr: data.programNameAr || existing.programNameAr,
        pointsPerAedSpent: data.pointsPerAedSpent !== undefined ? new Prisma.Decimal(data.pointsPerAedSpent) : existing.pointsPerAedSpent,
        pointsRedemptionRate: data.pointsRedemptionRate !== undefined ? Number(data.pointsRedemptionRate) : existing.pointsRedemptionRate,
        welcomeBonusPoints: data.welcomeBonusPoints !== undefined ? Number(data.welcomeBonusPoints) : existing.welcomeBonusPoints,
        minRedemptionPoints: data.minRedemptionPoints !== undefined ? Number(data.minRedemptionPoints) : existing.minRedemptionPoints,
        maxRedemptionAedPerOrder: data.maxRedemptionAedPerOrder !== undefined && data.maxRedemptionAedPerOrder !== null
          ? new Prisma.Decimal(data.maxRedemptionAedPerOrder)
          : (data.maxRedemptionAedPerOrder === null ? null : existing.maxRedemptionAedPerOrder),
        pointsExpiryDays: data.pointsExpiryDays !== undefined ? (data.pointsExpiryDays ? Number(data.pointsExpiryDays) : null) : existing.pointsExpiryDays,
        awardOnPaymentCapture: data.awardOnPaymentCapture !== undefined ? Boolean(data.awardOnPaymentCapture) : existing.awardOnPaymentCapture,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: adminUserId || "system",
        action: "UPDATE_LOYALTY_CONFIG",
        resourceType: "LOYALTY",
        resourceId: updated.id,
        diff: { previous: existing, updated },
      },
    });

    return updated;
  }

  /**
   * Retrieves active loyalty tiers in priority order
   */
  static async getTiers() {
    return prisma.loyaltyTier.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Evaluates customer points against dynamic database tiers
   */
  static async calculateTierForCustomer(points: number) {
    const rawTiers = await this.getTiers();
    const tiers = (rawTiers || []).map((t: any) => ({
      key: t.key || t.tier || "PRIVILEGE",
      nameEn: t.nameEn || "Privilege Member",
      nameAr: t.nameAr || "عضوية مسكيو بريفيلج",
      minPoints: Number(t.minPoints ?? t.thresholdSpend ?? 0),
      earningMultiplier: Number(t.earningMultiplier ?? t.multiplier ?? 1.0),
      benefitsEn: t.benefitsEn || [],
      benefitsAr: t.benefitsAr || [],
    }));

    let currentTier = tiers[0] || {
      key: "PRIVILEGE",
      nameEn: "Muschio Privilege Member",
      nameAr: "عضوية مسكيو بريفيلج",
      minPoints: 0,
      earningMultiplier: 1.0,
      benefitsEn: [],
      benefitsAr: [],
    };

    let nextTier: any = null;
    let pointsNeededForNext = 0;

    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (t && points >= t.minPoints) {
        currentTier = t;
        nextTier = tiers[i + 1] || null;
      }
    }

    if (nextTier) {
      pointsNeededForNext = Math.max(0, nextTier.minPoints - points);
    }

    return {
      tierKey: currentTier.key,
      tierNameEn: currentTier.nameEn,
      tierNameAr: currentTier.nameAr,
      earningMultiplier: Number(currentTier.earningMultiplier),
      benefitsEn: currentTier.benefitsEn,
      benefitsAr: currentTier.benefitsAr,
      nextTier: nextTier ? {
        key: nextTier.key,
        tierKey: nextTier.key,
        nameEn: nextTier.nameEn,
        nameAr: nextTier.nameAr,
        minPoints: nextTier.minPoints,
        pointsThreshold: nextTier.minPoints,
        pointsNeeded: pointsNeededForNext,
      } : null,
    };
  }

  /**
   * Awards points to a customer and writes an immutable ledger entry
   */
  static async awardPoints(
    customerId: string,
    points: number,
    orderId?: string,
    reason = "Order purchase reward",
    type: "EARN" | "WELCOME_BONUS" | "MANUAL_ADJUSTMENT" = "EARN",
    adminUserId?: string,
  ) {
    if (points <= 0) return null;

    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { id: true, loyaltyPoints: true, email: true },
      });
      if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");

      // Prevent duplicate awards for the same order and transaction type
      if (orderId && type === "EARN") {
        const existingTx = await tx.loyaltyTransaction.findFirst({
          where: { orderId, type: "EARN" },
        });
        if (existingTx) {
          console.warn(`[Loyalty] Points already awarded for order ${orderId}, skipping duplicate.`);
          return existingTx;
        }
      }

      const newBalance = customer.loyaltyPoints + points;

      await tx.customer.update({
        where: { id: customer.id },
        data: { loyaltyPoints: newBalance },
      });

      const ledgerEntry = await tx.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          type,
          points,
          balanceAfter: newBalance,
          orderId,
          reason,
          adminUserId,
        },
      });

      if (tx.businessEvent?.create) {
        await tx.businessEvent.create({
          data: {
            eventName: "LOYALTY_POINTS_AWARDED",
            aggregateType: "CUSTOMER",
            aggregateId: customer.id,
            payload: {
              points,
              balanceAfter: newBalance,
              orderId,
              reason,
              type,
            },
          },
        });
      }

      return ledgerEntry;
    });
  }

  /**
   * Deducts points upon redemption at checkout
   */
  static async deductPoints(
    customerId: string,
    points: number,
    orderId?: string,
    reason = "Checkout redemption",
  ) {
    if (points <= 0) return null;

    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { id: true, loyaltyPoints: true },
      });
      if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");
      if (customer.loyaltyPoints < points) {
        throw new ApiError(400, "INSUFFICIENT_LOYALTY_POINTS", "Not enough loyalty points available");
      }

      const newBalance = customer.loyaltyPoints - points;

      await tx.customer.update({
        where: { id: customer.id },
        data: { loyaltyPoints: newBalance },
      });

      const ledgerEntry = await tx.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          type: "REDEEM",
          points: -points,
          balanceAfter: newBalance,
          orderId,
          reason,
        },
      });

      return ledgerEntry;
    });
  }

  /**
   * A checkout hold is deliberately separate from the ledger. The points are
   * not deducted until payment is verified, which keeps abandoned Stripe
   * sessions from consuming customer credit.
   */
  static async commitOrderRedemption(orderId: string, tx?: Prisma.TransactionClient) {
    const run = async (client: Prisma.TransactionClient) => {
      if (!client.loyaltyReservation) return null;
      const reservation = await client.loyaltyReservation.findUnique({
        where: { orderId },
      });
      if (!reservation || reservation.status === "COMMITTED") return reservation;
      if (reservation.status === "RELEASED") {
        throw new ApiError(409, "LOYALTY_RESERVATION_RELEASED", "The loyalty redemption is no longer valid");
      }

      await client.$queryRaw`SELECT id FROM "Customer" WHERE id = ${reservation.customerId} FOR UPDATE`;
      const customer = await client.customer.findUnique({
        where: { id: reservation.customerId },
        select: { id: true, loyaltyPoints: true },
      });
      if (!customer || customer.loyaltyPoints < reservation.points) {
        throw new ApiError(409, "INSUFFICIENT_LOYALTY_POINTS", "The customer's loyalty balance changed before payment completed");
      }

      const newBalance = customer.loyaltyPoints - reservation.points;
      await client.customer.update({
        where: { id: customer.id },
        data: { loyaltyPoints: newBalance },
      });
      await client.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          type: "REDEEM",
          points: -reservation.points,
          balanceAfter: newBalance,
          orderId,
          reason: "Verified checkout loyalty redemption",
        },
      });
      return client.loyaltyReservation.update({
        where: { id: reservation.id },
        data: { status: "COMMITTED" },
      });
    };

    return tx ? run(tx) : prisma.$transaction(run);
  }

  /** Release an uncommitted hold after payment failure, expiry, or cancellation. */
  static async releaseOrderRedemption(orderId: string, tx?: Prisma.TransactionClient) {
    const run = async (client: Prisma.TransactionClient) => {
      if (!client.loyaltyReservation) return null;
      const reservation = await client.loyaltyReservation.findUnique({ where: { orderId } });
      if (!reservation || reservation.status !== "HELD") return reservation;
      return client.loyaltyReservation.update({
        where: { id: reservation.id },
        data: { status: "RELEASED" },
      });
    };

    return tx ? run(tx) : prisma.$transaction(run);
  }

  /** Refund a committed redemption, or release an outstanding hold. */
  static async refundOrderRedemption(orderId: string, tx?: Prisma.TransactionClient) {
    const run = async (client: Prisma.TransactionClient) => {
      if (!client.loyaltyReservation) return null;
      const reservation = await client.loyaltyReservation.findUnique({ where: { orderId } });
      if (!reservation || reservation.status === "RELEASED") return reservation;
      if (reservation.status === "HELD") {
        return client.loyaltyReservation.update({ where: { id: reservation.id }, data: { status: "RELEASED" } });
      }

      const priorRefund = await client.loyaltyTransaction.findFirst({
        where: { orderId, type: "REFUND", points: reservation.points },
      });
      if (priorRefund) {
        return client.loyaltyReservation.update({ where: { id: reservation.id }, data: { status: "RELEASED" } });
      }

      await client.$queryRaw`SELECT id FROM "Customer" WHERE id = ${reservation.customerId} FOR UPDATE`;
      const customer = await client.customer.findUnique({
        where: { id: reservation.customerId },
        select: { id: true, loyaltyPoints: true },
      });
      if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");
      const newBalance = customer.loyaltyPoints + reservation.points;
      await client.customer.update({ where: { id: customer.id }, data: { loyaltyPoints: newBalance } });
      await client.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          type: "REFUND",
          points: reservation.points,
          balanceAfter: newBalance,
          orderId,
          reason: "Restored redeemed points after order cancellation/refund",
        },
      });
      return client.loyaltyReservation.update({ where: { id: reservation.id }, data: { status: "RELEASED" } });
    };

    return tx ? run(tx) : prisma.$transaction(run);
  }

  static async releaseExpiredReservations(tx: Prisma.TransactionClient) {
    if (!tx.loyaltyReservation) return;
    await tx.loyaltyReservation.updateMany({
      where: { status: "HELD", expiresAt: { lte: new Date() } },
      data: { status: "RELEASED" },
    });
  }

  /** Award purchase points exactly once, after the order reaches a paid state. */
  static async awardOrderPoints(orderId: string, tx?: Prisma.TransactionClient) {
    const run = async (client: Prisma.TransactionClient) => {
      if (!client.order?.findUnique || !client.loyaltyTransaction?.findFirst) return null;
      const order = await client.order.findUnique({
        where: { id: orderId },
        select: { id: true, customerId: true, totalAmount: true, status: true },
      });
      if (!order?.customerId) return null;
      const config = await this.getProgramConfig();
      if (!config.isEnabled || !config.awardOnPaymentCapture || !["PAID", "DELIVERED"].includes(order.status)) return null;

      const existing = await client.loyaltyTransaction.findFirst({
        where: { orderId, type: "EARN" },
      });
      if (existing) return existing;

      await client.$queryRaw`SELECT id FROM "Customer" WHERE id = ${order.customerId} FOR UPDATE`;
      const customer = await client.customer.findUnique({
        where: { id: order.customerId },
        select: { id: true, loyaltyPoints: true },
      });
      if (!customer) return null;
      const tier = await this.calculateTierForCustomer(customer.loyaltyPoints);
      const points = Math.floor(Number(order.totalAmount) * Number(config.pointsPerAedSpent) * tier.earningMultiplier);
      if (points <= 0) return null;
      const newBalance = customer.loyaltyPoints + points;
      await client.customer.update({ where: { id: customer.id }, data: { loyaltyPoints: newBalance } });
      return client.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          type: "EARN",
          points,
          balanceAfter: newBalance,
          orderId,
          reason: `Verified payment reward (${tier.earningMultiplier}x tier rate)`,
        },
      });
    };

    return tx ? run(tx) : prisma.$transaction(run);
  }

  /**
   * Reverse points when an order is cancelled or refunded
   */
  static async reverseOrderPoints(orderId: string, reason = "Order cancelled / refunded") {
    return prisma.$transaction(async (tx) => {
      // Find all earn transactions for this order
      const earnTxs = (await tx.loyaltyTransaction.findMany({
        where: { orderId, type: "EARN" },
      })) || [];

      let totalReversed = 0;
      let lastNewBalance = 0;

      for (const earnTx of earnTxs) {
        const customer = await tx.customer.findUnique({
          where: { id: earnTx.customerId },
          select: { id: true, loyaltyPoints: true },
        });
        if (customer) {
          const deduction = Math.abs(earnTx.points);
          const newBalance = Math.max(0, customer.loyaltyPoints - deduction);
          totalReversed += deduction;
          lastNewBalance = newBalance;

          await tx.customer.update({
            where: { id: customer.id },
            data: { loyaltyPoints: newBalance },
          });

          await tx.loyaltyTransaction.create({
            data: {
              customerId: customer.id,
              type: "REFUND",
              points: -deduction,
              balanceAfter: newBalance,
              orderId,
              reason,
            },
          });
        }
      }

      // If customer redeemed points on this order, restore them!
      const redeemTxs = (await tx.loyaltyTransaction.findMany({
        where: { orderId, type: "REDEEM" },
      })) || [];

      for (const redeemTx of redeemTxs) {
        const customer = await tx.customer.findUnique({
          where: { id: redeemTx.customerId },
          select: { id: true, loyaltyPoints: true },
        });
        if (customer) {
          const refundPoints = Math.abs(redeemTx.points);
          const newBalance = customer.loyaltyPoints + refundPoints;
          lastNewBalance = newBalance;

          await tx.customer.update({
            where: { id: customer.id },
            data: { loyaltyPoints: newBalance },
          });

          await tx.loyaltyTransaction.create({
            data: {
              customerId: customer.id,
              type: "REFUND",
              points: refundPoints,
              balanceAfter: newBalance,
              orderId,
              reason: `Restored redeemed points for ${reason}`,
            },
          });
        }
      }

      return {
        reversedPoints: totalReversed,
        newBalance: lastNewBalance,
      };
    });
  }

  /**
   * Mandatory Administrator manual adjustment with audit logging
   */
  static async manualAdjustment(
    customerId: string,
    pointsDelta: number,
    reason: string,
    adminUserId: string,
  ) {
    if (!reason || !reason.trim()) {
      throw new ApiError(400, "REASON_REQUIRED", "Mandatory audit reason required for manual loyalty adjustments");
    }
    if (pointsDelta === 0) {
      throw new ApiError(400, "INVALID_POINTS", "Adjustment points delta cannot be zero");
    }

    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { id: true, loyaltyPoints: true, email: true },
      });
      if (!customer) throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer not found");

      const newBalance = Math.max(0, customer.loyaltyPoints + pointsDelta);

      await tx.customer.update({
        where: { id: customer.id },
        data: { loyaltyPoints: newBalance },
      });

      const ledgerEntry = await tx.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          type: "MANUAL_ADJUSTMENT",
          points: pointsDelta,
          balanceAfter: newBalance,
          reason,
          adminUserId,
        },
      });

      if (tx.auditLog?.create) {
        await tx.auditLog.create({
          data: {
            adminUserId,
            action: "MANUAL_LOYALTY_ADJUSTMENT",
            resourceType: "CUSTOMER_LOYALTY",
            resourceId: customer.id,
            diff: {
              customerEmail: customer.email,
              pointsDelta,
              balanceBefore: customer.loyaltyPoints,
              balanceAfter: newBalance,
              reason,
            },
          },
        });
      }

      return {
        ...ledgerEntry,
        newBalance,
      };
    });
  }

  /**
   * Awards welcome bonus points if enabled
   */
  static async awardWelcomeBonus(customerId: string) {
    const config = await this.getProgramConfig();
    const isEnabled = config?.isEnabled ?? true;
    const bonus = Number(config?.welcomeBonusPoints || 100);
    if (!isEnabled || bonus <= 0) return null;

    // Check if welcome bonus was already granted
    const existingBonus = await prisma.loyaltyTransaction.findFirst({
      where: { customerId, type: "WELCOME_BONUS" },
    });
    if (existingBonus) return null;

    await this.awardPoints(
      customerId,
      bonus,
      undefined,
      "Muschio Privilege Welcome Bonus",
      "WELCOME_BONUS",
    );

    return bonus;
  }

  /**
   * Retrieves full transaction history for a customer
   */
  static async getCustomerLedger(customerId: string) {
    return prisma.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }
}
