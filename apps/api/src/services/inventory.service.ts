import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { ApiError } from "../middleware/error-handler";

export class InventoryService {
  /**
   * Reserves stock atomically for 15 minutes.
   * Uses transactional isolation and logs reservation movement to StockLedger.
   */
  static async reserveInventory(
    params: {
      items: Array<{ variantId: string; quantity: number }>;
      sessionId?: string;
      orderId?: string;
      durationMinutes?: number;
      warehouseCode?: string;
    },
    transaction?: Prisma.TransactionClient,
  ) {
    const {
      items,
      sessionId,
      orderId,
      durationMinutes = 15,
      warehouseCode = "DXB-MAIN",
    } = params;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const reserve = async (tx: Prisma.TransactionClient) => {
      const reservations = [];

      // Find warehouse
      let warehouse = await tx.warehouse.findUnique({
        where: { code: warehouseCode },
      });

      if (!warehouse) {
        warehouse = await tx.warehouse.findFirst();
      }

      for (const item of [...items].sort((a, b) =>
        a.variantId.localeCompare(b.variantId),
      )) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1)
          throw new ApiError(
            400,
            "INVALID_QUANTITY",
            "Quantity must be a positive integer",
          );
        await tx.$queryRaw`SELECT id FROM "Inventory" WHERE "variantId" = ${item.variantId} FOR UPDATE`;
        // Find aggregate inventory record
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });

        if (!inventory) {
          throw new ApiError(
            404,
            "VARIANT_NOT_FOUND",
            `Inventory for variant ${item.variantId} not found`,
          );
        }

        const available = inventory.sealedQuantity - inventory.reservedQuantity;
        if (available < item.quantity) {
          throw new ApiError(
            409,
            "INSUFFICIENT_STOCK",
            `Insufficient stock for requested item. Available: ${Math.max(0, available)}, requested: ${item.quantity}`,
          );
        }

        // Increment reserved quantity atomically
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            reservedQuantity: { increment: item.quantity },
          },
        });

        // Create reservation record
        const reservation = await tx.inventoryReservation.create({
          data: {
            variantId: item.variantId,
            quantity: item.quantity,
            sessionId,
            orderId,
            expiresAt,
          },
        });

        // Log to auditable StockLedger if warehouse exists
        if (warehouse) {
          await tx.stockLedger.create({
            data: {
              warehouseId: warehouse.id,
              variantId: item.variantId,
              movementType: "ORDER_RESERVATION",
              quantity: -item.quantity,
              referenceType: "ORDER_RESERVATION",
              referenceId: reservation.id,
              notes: `15-min reservation hold for session ${sessionId || "order " + orderId}`,
            },
          });
        }

        reservations.push(reservation);
      }

      return {
        success: true,
        reservations,
        expiresAt,
      };
    };
    return transaction ? reserve(transaction) : prisma.$transaction(reserve);
  }

  /**
   * Releases expired reservations and returns stock to available pool.
   */
  static async reconcileExpiredReservations(): Promise<{ releasedCount: number }> {
    try {
      const now = new Date();
      const expired = await prisma.inventoryReservation.findMany({
        where: {
          expiresAt: { lte: now },
          isReleased: false,
        },
      });

      if (expired.length === 0) return { releasedCount: 0 };

      let releasedCount = 0;
      const orderIds = new Set<string>();

      for (const res of expired) {
        try {
          const claimed = await prisma.inventoryReservation.updateMany({
            where: { id: res.id, isReleased: false, expiresAt: { lte: now } },
            data: { isReleased: true },
          });

          if (claimed.count > 0) {
            await prisma.inventory.updateMany({
              where: { variantId: res.variantId },
              data: {
                reservedQuantity: { decrement: res.quantity },
              },
            });
            releasedCount += res.quantity;
            if (res.orderId) {
              orderIds.add(res.orderId);
            }
          }
        } catch (itemErr) {
          console.warn(`[Inventory] Error releasing reservation ${res.id}:`, itemErr);
        }
      }

      for (const orderId of orderIds) {
        try {
          const remaining = await prisma.inventoryReservation.count({
            where: { orderId, isReleased: false },
          });
          if (remaining === 0) {
            await prisma.order.updateMany({
              where: {
                id: orderId,
                status: { in: ["PENDING", "PAYMENT_PENDING"] },
              },
              data: { status: "PAYMENT_FAILED" },
            });
          }
        } catch {}
      }

      return { releasedCount };
    } catch (e) {
      console.error("[Inventory Reconciliation Error]", e);
      return { releasedCount: 0 };
    }
  }

  /**
   * Permanently fulfills stock upon successful order capture.
   */
  static async commitOrderInventory(
    orderId: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const commit = async (tx: Prisma.TransactionClient) => {
      await tx.$queryRaw`SELECT id FROM "InventoryReservation" WHERE "orderId" = ${orderId} ORDER BY "variantId" FOR UPDATE`;
      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId, isReleased: false },
        orderBy: { variantId: "asc" },
      });
      if (
        !reservations.length ||
        reservations.some((res) => res.expiresAt <= new Date())
      ) {
        // Fallback: If reservations expired or were not pre-held, reconcile directly from order items
        // In luxury e-commerce, once payment is captured by the gateway, never fail the transaction.
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order && order.items.length) {
          const defaultWarehouse = await tx.warehouse.findFirst();
          for (const item of order.items) {
            const inv = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
            if (inv) {
              await tx.inventory.update({
                where: { variantId: item.variantId },
                data: {
                  sealedQuantity: { decrement: item.quantity },
                  reservedQuantity: { decrement: Math.min(inv.reservedQuantity, item.quantity) },
                },
              });

              if (defaultWarehouse) {
                await tx.stockLedger.create({
                  data: {
                    warehouseId: defaultWarehouse.id,
                    variantId: item.variantId,
                    movementType: "FULFILLMENT_DISPATCH",
                    quantity: -item.quantity,
                    referenceType: "ORDER_FULFILLMENT",
                    referenceId: orderId,
                    notes: `Order ${orderId} inventory reconciled upon payment capture`,
                  },
                });
              }
            }
          }

          // Mark any expired reservations for this order as released
          await tx.inventoryReservation.updateMany({
            where: { orderId },
            data: { isReleased: true },
          });

          return { committedReservations: order.items.length, reconciled: true };
        }

        throw new ApiError(
          409,
          "RESERVATION_EXPIRED",
          "Inventory hold has expired; payment requires reconciliation",
        );
      }
      const defaultWarehouse = await tx.warehouse.findFirst();

      for (const res of reservations) {
        await tx.$queryRaw`SELECT id FROM "Inventory" WHERE "variantId" = ${res.variantId} FOR UPDATE`;
        // Decrement both sealed and reserved quantity
        await tx.inventory.update({
          where: { variantId: res.variantId },
          data: {
            sealedQuantity: { decrement: res.quantity },
            reservedQuantity: { decrement: res.quantity },
          },
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { isReleased: true },
        });

        if (defaultWarehouse) {
          await tx.stockLedger.create({
            data: {
              warehouseId: defaultWarehouse.id,
              variantId: res.variantId,
              movementType: "FULFILLMENT_DISPATCH",
              quantity: -res.quantity,
              referenceType: "ORDER_FULFILLMENT",
              referenceId: orderId,
              notes: `Order ${orderId} inventory committed and dispatched`,
            },
          });
        }
      }

      return { committedReservations: reservations.length };
    };
    return transaction ? commit(transaction) : prisma.$transaction(commit);
  }
  static async releaseOrderReservations(
    orderId: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const release = async (tx: Prisma.TransactionClient) => {
      await tx.$queryRaw`SELECT id FROM "InventoryReservation" WHERE "orderId" = ${orderId} ORDER BY "variantId" FOR UPDATE`;
      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId, isReleased: false },
        orderBy: { variantId: "asc" },
      });
      for (const reservation of reservations) {
        await tx.$queryRaw`SELECT id FROM "Inventory" WHERE "variantId" = ${reservation.variantId} FOR UPDATE`;
        await tx.inventory.update({
          where: { variantId: reservation.variantId },
          data: { reservedQuantity: { decrement: reservation.quantity } },
        });
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: { isReleased: true },
        });
      }
    };
    return transaction ? release(transaction) : prisma.$transaction(release);
  }

  /**
   * Allocate stock from sealed to tester inventory for sample vials / Discovery sets.
   */
  static async allocateTesterStock(params: {
    variantId: string;
    warehouseId: string;
    quantity: number;
    lotId?: string;
    reason?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { variantId: params.variantId },
        data: {
          sealedQuantity: { decrement: params.quantity },
          testerQuantity: { increment: params.quantity },
        },
      });

      await tx.stockLedger.create({
        data: {
          warehouseId: params.warehouseId,
          lotId: params.lotId,
          variantId: params.variantId,
          movementType: "TESTER_ALLOCATION",
          quantity: params.quantity,
          referenceType: "TESTER_ALLOCATION",
          notes:
            params.reason ||
            "Converted sealed bottle to 5x2ml discovery vials/testers",
        },
      });

      return { success: true };
    });
  }

  /**
   * Query full auditable stock ledger history
   */
  static async getStockLedgerHistory(variantId?: string, limit = 50) {
    return prisma.stockLedger.findMany({
      where: variantId ? { variantId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        warehouse: true,
        lot: true,
      },
    });
  }
}
