import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import { ReturnCondition, ReturnDisposition, ReturnAction } from "@prisma/client";

export class ReturnsService {
  /**
   * Customer initiates a return request
   */
  static async requestReturn(data: {
    orderId: string;
    customerId: string;
    reason: string;
    requestedAction?: ReturnAction;
    items: Array<{
      orderItemId: string;
      quantity: number;
    }>;
  }) {
    const returnNumber = `RET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return prisma.returnRequest.create({
      data: {
        returnNumber,
        orderId: data.orderId,
        customerId: data.customerId,
        reason: data.reason,
        requestedAction: data.requestedAction || "REFUND",
        status: "REQUESTED",
        items: {
          create: data.items.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: { orderItem: true },
        },
      },
    });
  }

  /**
   * Warehouse inspection station evaluates physical returned fragrance.
   * Returned stock NEVER automatically becomes sellable stock;
   * disposition determines if it is RESTOCK_SELLABLE, ALLOCATE_TESTER, or QUARANTINE_DISPOSAL.
   */
  static async inspectReturnItem(params: {
    returnItemId: string;
    inspectedBy: string;
    condition: ReturnCondition;
    disposition: ReturnDisposition;
    refundApproved: boolean;
    notes?: string;
    warehouseId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch return item details
      const returnItem = await tx.returnItem.findUnique({
        where: { id: params.returnItemId },
        include: {
          orderItem: true,
          returnRequest: true,
        },
      });

      if (!returnItem) {
        throw new ApiError(404, "RETURN_ITEM_NOT_FOUND", "Return item not found");
      }

      // 2. Create inspection record
      const inspection = await tx.returnInspection.create({
        data: {
          returnItemId: params.returnItemId,
          inspectedBy: params.inspectedBy,
          condition: params.condition,
          disposition: params.disposition,
          refundApproved: params.refundApproved,
          notes: params.notes,
        },
      });

      const warehouse = params.warehouseId
        ? await tx.warehouse.findUnique({ where: { id: params.warehouseId } })
        : await tx.warehouse.findFirst();

      const variantId = returnItem.orderItem.variantId;
      const quantity = returnItem.quantity;

      // 3. Update physical stock according to strict disposition rules
      if (params.disposition === "RESTOCK_SELLABLE" && params.condition === "PRISTINE_SEALED") {
        await tx.inventory.update({
          where: { variantId },
          data: { sealedQuantity: { increment: quantity } },
        });

        if (warehouse) {
          await tx.stockLedger.create({
            data: {
              warehouseId: warehouse.id,
              variantId,
              movementType: "RETURN_RESTOCK",
              quantity,
              referenceType: "RETURN_INSPECTION",
              referenceId: returnItem.returnRequestId,
              notes: `Pristine sealed return restocked: ${params.notes || ""}`,
            },
          });
        }
      } else if (params.disposition === "ALLOCATE_TESTER") {
        await tx.inventory.update({
          where: { variantId },
          data: { testerQuantity: { increment: quantity } },
        });

        if (warehouse) {
          await tx.stockLedger.create({
            data: {
              warehouseId: warehouse.id,
              variantId,
              movementType: "TESTER_ALLOCATION",
              quantity,
              referenceType: "RETURN_INSPECTION",
              referenceId: returnItem.returnRequestId,
              notes: `Opened returned item reallocated to tester/sample stock`,
            },
          });
        }
      } else {
        // Quarantine or disposal
        if (warehouse) {
          await tx.stockLedger.create({
            data: {
              warehouseId: warehouse.id,
              variantId,
              movementType: "RETURN_QUARANTINE",
              quantity: -quantity,
              referenceType: "RETURN_INSPECTION",
              referenceId: returnItem.returnRequestId,
              notes: `Damaged/Quarantine return disposed: ${params.condition}`,
            },
          });
        }
      }

      // 4. Update return request status
      await tx.returnRequest.update({
        where: { id: returnItem.returnRequestId },
        data: { status: "COMPLETED" },
      });

      return inspection;
    });
  }

  /**
   * List returns for admin portal
   */
  static async getReturnRequests(status?: string) {
    return prisma.returnRequest.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        order: true,
        customer: true,
        items: {
          include: {
            orderItem: true,
            inspection: true,
          },
        },
      },
    });
  }
}
