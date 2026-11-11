import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import { Prisma } from "@prisma/client";

export class GiftCardService {
  /**
   * Helper to generate masked / formatted gift card code
   * Format: MSC-GC-XXXX-XXXX-XXXX
   */
  static generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `MSC-GC-${segment()}-${segment()}-${segment()}`;
  }

  /**
   * Admin creates and issues a Gift Card
   */
  static async createGiftCard(
    data: {
      amount?: number;
      initialBalance?: number;
      recipientEmail?: string;
      recipientName?: string;
      senderName?: string;
      personalMessage?: string;
      expiresAt?: string | Date;
    },
    adminUserId?: string,
  ) {
    const rawAmount = data.amount ?? data.initialBalance ?? 0;
    if (!rawAmount || Number(rawAmount) <= 0) {
      throw new ApiError(400, "INVALID_AMOUNT", "Gift card initial balance must be greater than zero");
    }

    const code = this.generateCode();
    const balance = new Prisma.Decimal(rawAmount);

    return prisma.$transaction(async (tx) => {
      const giftCard = await tx.giftCard.create({
        data: {
          code,
          initialBalance: balance,
          remainingBalance: balance,
          currency: "AED",
          recipientEmail: data.recipientEmail?.trim() || null,
          recipientName: data.recipientName?.trim() || null,
          senderName: data.senderName?.trim() || null,
          personalMessage: data.personalMessage?.trim() || null,
          status: "ACTIVE",
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          issuedByAdminId: adminUserId || null,
        },
      });

      await tx.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          type: "ISSUANCE",
          amount: balance,
          balanceAfter: balance,
          notes: "Initial gift card issuance",
        },
      });

      if (adminUserId && tx.auditLog?.create) {
        await tx.auditLog.create({
          data: {
            adminUserId,
            action: "ISSUE_GIFT_CARD",
            resourceType: "GIFT_CARD",
            resourceId: giftCard.id,
            diff: {
              codeMasked: `${giftCard.code.slice(0, 10)}••••`,
              amount: rawAmount,
              recipient: data.recipientEmail,
            },
          },
        });
      }

      return {
        ...giftCard,
        balance: Number(rawAmount),
      };
    });
  }

  /**
   * Public / checkout validation of a gift card
   */
  static async getGiftCardByCode(code: string) {
    const formatted = code.trim().toUpperCase();
    const card = await prisma.giftCard.findUnique({
      where: { code: formatted },
    });

    if (!card) throw new ApiError(404, "GIFT_CARD_NOT_FOUND", "Gift card not found");
    if (card.status !== "ACTIVE") {
      throw new ApiError(400, "GIFT_CARD_INACTIVE", `Gift card is ${card.status.toLowerCase()}`);
    }
    if (card.expiresAt && card.expiresAt < new Date()) {
      throw new ApiError(400, "GIFT_CARD_EXPIRED", "Gift card has expired");
    }
    if (card.remainingBalance.lessThanOrEqualTo(0)) {
      throw new ApiError(400, "GIFT_CARD_EMPTY", "Gift card has zero remaining balance");
    }

    return {
      code: card.code,
      remainingBalance: Number(card.remainingBalance),
      currency: card.currency,
      expiresAt: card.expiresAt?.toISOString() || null,
    };
  }

  /**
   * List all gift cards for Admin
   */
  static async listGiftCards(filter?: { status?: string }) {
    return prisma.giftCard.findMany({
      where: {
        ...(filter?.status ? { status: filter.status as any } : {}),
      },
      include: {
        transactions: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Redeems an amount from a gift card at checkout atomically
   */
  static async redeemGiftCard(
    codeOrPayload: string | { code: string; amount?: number; amountToDeduct?: number; orderId?: string },
    amountArg?: number,
    orderIdArg?: string,
    tx?: Prisma.TransactionClient,
  ) {
    let code: string;
    let amount: number;
    let orderId: string;

    if (typeof codeOrPayload === "object" && codeOrPayload !== null) {
      code = codeOrPayload.code;
      amount = Number(codeOrPayload.amountToDeduct ?? codeOrPayload.amount ?? amountArg ?? 0);
      orderId = codeOrPayload.orderId || orderIdArg || "order";
    } else {
      code = String(codeOrPayload || "");
      amount = Number(amountArg ?? 0);
      orderId = orderIdArg || "order";
    }

    if (amount <= 0) return null;
    const client = tx || prisma;
    const formatted = (code || "").trim().toUpperCase();

    const card = await client.giftCard.findUnique({ where: { code: formatted } });
    if (!card) throw new ApiError(404, "GIFT_CARD_NOT_FOUND", "Gift card not found");
    if (card.status !== "ACTIVE") throw new ApiError(400, "GIFT_CARD_INACTIVE", "Gift card is not active");

    const currentBalance = card.remainingBalance instanceof Prisma.Decimal
      ? Number(card.remainingBalance)
      : Number((card as any).remainingBalance ?? (card as any).balance ?? 0);

    if (currentBalance < amount) {
      throw new ApiError(400, "INSUFFICIENT_BALANCE", "Insufficient gift card balance");
    }

    const newBalanceNum = Math.max(0, currentBalance - amount);
    const newBalance = new Prisma.Decimal(newBalanceNum);
    const newStatus = newBalanceNum === 0 ? "REDEEMED" : "ACTIVE";

    const updated = await client.giftCard.update({
      where: { id: card.id },
      data: {
        remainingBalance: newBalance,
        status: newStatus,
      },
    });

    await client.giftCardTransaction.create({
      data: {
        giftCardId: card.id,
        orderId,
        type: "REDEMPTION",
        amount: new Prisma.Decimal(-amount),
        balanceAfter: newBalance,
        notes: `Redemption for Order ${orderId}`,
      },
    });

    return {
      ...updated,
      appliedAmount: amount,
      remainingBalance: newBalanceNum,
    };
  }
}
