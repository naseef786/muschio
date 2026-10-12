import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";

export class InventoryService {
  /**
   * Reserves stock atomically for 15 minutes.
   * Uses transactional isolation and logs reservation movement to StockLedger.
   */
  static async reserveInventory(params: {
    items: Array<{ variantId: string; quantity: number }>;
    sessionId?: string;
    orderId?: string;
    durationMinutes?: number;
    warehouseCode?: string;
  }) {
    const { items, sessionId, orderId, durationMinutes = 15, warehouseCode = "DXB-MAIN" } = params;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const reservations = [];

      // Find warehouse
      let warehouse = await tx.warehouse.findUnique({
        where: { code: warehouseCode },
      });

      if (!warehouse) {
        warehouse = await tx.warehouse.findFirst();
      }

      for (const item of items) {
        // Find aggregate inventory record
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });

        if (!inventory) {
          throw new ApiError(404, "VARIANT_NOT_FOUND", `Inventory for variant ${item.variantId} not found`);
        }

        const available = inventory.sealedQuantity - inventory.reservedQuantity;
        if (available < item.quantity) {
          throw new ApiError(
            409,
            "INSUFFICIENT_STOCK",
            `Insufficient stock for requested item. Available: ${Math.max(0, available)}, requested: ${item.quantity}`
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
    });
  }

  /**
   * Releases expired reservations and returns stock to available pool.
   */
  static async reconcileExpiredReservations() {
    try {
      const now = new Date();
      const expired = await prisma.inventoryReservation.findMany({
        where: {
          expiresAt: { lte: now },
          isReleased: false,
        },
      });

      if (expired.length === 0) return { releasedCount: 0 };

      return await prisma.$transaction(async (tx) => {
        let releasedCount = 0;
        for (const res of expired) {
          await tx.inventory.update({
            where: { variantId: res.variantId },
            data: {
              reservedQuantity: { decrement: res.quantity },
            },
          });

          await tx.inventoryReservation.update({
            where: { id: res.id },
            data: { isReleased: true },
          });

          releasedCount += res.quantity;
        }
        return { releasedCount };
      });
    } catch (e) {
      return { releasedCount: 0 };
    }
  }


  /**
   * Permanently fulfills stock upon successful order capture.
   */
  static async commitOrderInventory(orderId: string) {
    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId, isReleased: false },
    });

    return prisma.$transaction(async (tx) => {
      const defaultWarehouse = await tx.warehouse.findFirst();

      for (const res of reservations) {
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
    });
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
          notes: params.reason || "Converted sealed bottle to 5x2ml discovery vials/testers",
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
