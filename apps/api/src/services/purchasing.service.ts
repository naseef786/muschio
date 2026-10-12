import { prisma } from "../prisma";
import { Decimal } from "@prisma/client/runtime/library";

export class PurchasingService {
  /**
   * List all suppliers with active catalogs
   */
  static async getSuppliers() {
    return prisma.supplier.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { purchaseOrders: true, inventoryLots: true },
        },
      },
    });
  }

  /**
   * Create a new purchase order
   */
  static async createPurchaseOrder(data: {
    supplierId: string;
    currency?: string;
    notes?: string;
    items: Array<{
      variantId: string;
      quantityOrdered: number;
      unitCost: number;
    }>;
  }) {
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCost = data.items.reduce((acc, item) => acc + item.quantityOrdered * item.unitCost, 0);

    return prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: data.supplierId,
        currency: data.currency || "AED",
        totalCost: new Decimal(totalCost),
        notes: data.notes,
        status: "SUBMITTED",
        items: {
          create: data.items.map((item) => ({
            variantId: item.variantId,
            quantityOrdered: item.quantityOrdered,
            unitCost: new Decimal(item.unitCost),
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });
  }

  /**
   * Process Goods Receipt (GRN): receives stock, updates inventory aggregate, creates InventoryLot, and writes to StockLedger.
   */
  static async receiveGoodsReceipt(params: {
    purchaseOrderId: string;
    warehouseId: string;
    invoiceRef?: string;
    receivedItems: Array<{
      variantId: string;
      quantityReceived: number;
      batchCode: string;
      purchaseCost: number;
      mfgDate?: Date;
      expiryDate?: Date;
    }>;
  }) {
    const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return prisma.$transaction(async (tx) => {
      // 1. Create Goods Receipt record
      const grn = await tx.goodsReceipt.create({
        data: {
          grnNumber,
          purchaseOrderId: params.purchaseOrderId,
          warehouseId: params.warehouseId,
          invoiceRef: params.invoiceRef,
        },
      });

      // 2. Process each received item into physical lots and stock ledger
      for (const item of params.receivedItems) {
        // Create InventoryLot
        const lot = await tx.inventoryLot.create({
          data: {
            warehouseId: params.warehouseId,
            variantId: item.variantId,
            batchCode: item.batchCode,
            purchaseCost: new Decimal(item.purchaseCost),
            quantityReceived: item.quantityReceived,
            quantityAvailable: item.quantityReceived,
            manufactureDate: item.mfgDate,
            expiryDate: item.expiryDate,
          },
        });

        // Update Aggregate Inventory
        await tx.inventory.upsert({
          where: { variantId: item.variantId },
          update: {
            sealedQuantity: { increment: item.quantityReceived },
          },
          create: {
            variantId: item.variantId,
            sealedQuantity: item.quantityReceived,
            testerQuantity: 0,
            reservedQuantity: 0,
          },
        });

        // Update cost price on variant if applicable
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            costPrice: new Decimal(item.purchaseCost),
          },
        });

        // Log to StockLedger
        await tx.stockLedger.create({
          data: {
            warehouseId: params.warehouseId,
            lotId: lot.id,
            variantId: item.variantId,
            movementType: "GOODS_RECEIPT",
            quantity: item.quantityReceived,
            referenceType: "GOODS_RECEIPT",
            referenceId: grn.id,
            notes: `Received batch ${item.batchCode} via GRN ${grnNumber}`,
          },
        });
      }

      // Update PO status
      await tx.purchaseOrder.update({
        where: { id: params.purchaseOrderId },
        data: { status: "RECEIVED" },
      });

      return grn;
    });
  }
}
