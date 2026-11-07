import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import { ReturnCondition, ReturnDisposition, ReturnAction } from "@prisma/client";

export class ReturnsService {
  /**
   * Customer initiates a return request under the 7-day guarantee policy
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
          include: { orderItem: { include: { variant: { include: { product: true } } } } },
        },
        order: true,
        customer: true,
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

      // 2. Upsert inspection record
      const inspection = await tx.returnInspection.upsert({
        where: { returnItemId: params.returnItemId },
        create: {
          returnItemId: params.returnItemId,
          inspectedBy: params.inspectedBy,
          condition: params.condition,
          disposition: params.disposition,
          refundApproved: params.refundApproved,
          notes: params.notes,
        },
        update: {
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
        }).catch(() => null);

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
          }).catch(() => null);
        }
      } else if (params.disposition === "ALLOCATE_TESTER") {
        await tx.inventory.update({
          where: { variantId },
          data: { testerQuantity: { increment: quantity } },
        }).catch(() => null);

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
          }).catch(() => null);
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
          }).catch(() => null);
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
   * Complete inspection directly by return request ID (used by admin portal actions)
   */
  static async inspectReturnRequest(params: {
    returnRequestId: string;
    disposition: ReturnDisposition;
    condition?: ReturnCondition;
    adminUserId?: string;
    notes?: string;
  }) {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: params.returnRequestId },
      include: { items: true },
    });

    if (!returnRequest) {
      throw new ApiError(404, "RETURN_NOT_FOUND", "Return request not found");
    }

    const condition = params.condition || (params.disposition === "RESTOCK_SELLABLE" ? "PRISTINE_SEALED" : "OPENED_SPRAYED");

    for (const item of returnRequest.items) {
      await this.inspectReturnItem({
        returnItemId: item.id,
        inspectedBy: params.adminUserId || "admin",
        condition,
        disposition: params.disposition,
        refundApproved: true,
        notes: params.notes || "Inspected via Muschio Admin RMA Portal",
      });
    }

    const updated = await prisma.returnRequest.update({
      where: { id: params.returnRequestId },
      data: { status: "COMPLETED" },
      include: {
        customer: true,
        order: true,
        items: { include: { orderItem: { include: { variant: { include: { product: true } } } }, inspection: true } },
      },
    });

    if (params.adminUserId) {
      await prisma.auditLog.create({
        data: {
          adminUserId: params.adminUserId,
          action: "RETURN_INSPECTED_COMPLETED",
          resourceType: "RETURN",
          resourceId: params.returnRequestId,
          diff: { disposition: params.disposition, condition },
        },
      }).catch(() => null);
    }

    return updated;
  }

  /**
   * List returns for admin portal
   */
  static async getReturnRequests(status?: string) {
    await this.ensureDefaultReturns();

    return prisma.returnRequest.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            shippingAddress: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            orderItem: {
              include: {
                variant: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        nameEn: true,
                        nameAr: true,
                        images: true,
                        brand: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
            inspection: true,
          },
        },
      },
    });
  }

  /**
   * Ensures default sample return requests exist in Neon DB
   */
  static async ensureDefaultReturns() {
    const count = await prisma.returnRequest.count();
    if (count > 0) return;

    // Find any delivered or paid order
    const order = await prisma.order.findFirst({
      include: { items: true, customer: true },
    });

    if (!order || order.items.length === 0 || !order.customerId) return;
    const firstItem = order.items[0];
    if (!firstItem) return;

    const returnNumber = `RET-${new Date().getFullYear()}-0101`;
    await prisma.returnRequest.create({
      data: {
        returnNumber,
        orderId: order.id,
        customerId: order.customerId,
        reason: "Customer preferred alternative fragrance profile under 7-day trial policy.",
        requestedAction: "REFUND",
        status: "REQUESTED",
        items: {
          create: [
            {
              orderItemId: firstItem.id,
              quantity: 1,
            },
          ],
        },
      },
    });
  }
}
