import { z } from "zod";

export const StockMovementTypeSchema = z.enum([
  "GOODS_RECEIPT",
  "ORDER_RESERVATION",
  "RESERVATION_RELEASED",
  "FULFILLMENT_DISPATCH",
  "RETURN_QUARANTINE",
  "RETURN_RESTOCK",
  "TESTER_ALLOCATION",
  "DAMAGED_WRITE_OFF",
  "INVENTORY_ADJUSTMENT"
]);
export type StockMovementType = z.infer<typeof StockMovementTypeSchema>;

export const WarehouseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  countryCode: z.string().default("AE"),
  isDefault: z.boolean().default(false),
});
export type Warehouse = z.infer<typeof WarehouseSchema>;

export const InventoryLotSchema = z.object({
  id: z.string().uuid(),
  warehouseId: z.string().uuid(),
  variantId: z.string().uuid(),
  supplierId: z.string().uuid().optional().nullable(),
  batchCode: z.string().min(1),
  purchaseCost: z.number().nonnegative(),
  quantityReceived: z.number().int().nonnegative(),
  quantityAvailable: z.number().int().nonnegative(),
  quantityReserved: z.number().int().nonnegative().default(0),
  quantityDamaged: z.number().int().nonnegative().default(0),
  quantityQuarantined: z.number().int().nonnegative().default(0),
  quantityTester: z.number().int().nonnegative().default(0),
  manufactureDate: z.string().or(z.date()).optional().nullable(),
  expiryDate: z.string().or(z.date()).optional().nullable(),
});
export type InventoryLot = z.infer<typeof InventoryLotSchema>;

export const StockLedgerSchema = z.object({
  id: z.string().uuid(),
  warehouseId: z.string().uuid(),
  lotId: z.string().uuid().optional().nullable(),
  variantId: z.string().uuid(),
  movementType: StockMovementTypeSchema,
  quantity: z.number().int(),
  referenceType: z.string().optional().nullable(),
  referenceId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().or(z.date()),
});
export type StockLedger = z.infer<typeof StockLedgerSchema>;

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  contactEmail: z.string().email().optional().nullable(),
  country: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
});
export type Supplier = z.infer<typeof SupplierSchema>;

export const PurchaseOrderStatusSchema = z.enum([
  "DRAFT",
  "SUBMITTED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED"
]);
export type PurchaseOrderStatus = z.infer<typeof PurchaseOrderStatusSchema>;

export const PurchaseOrderItemSchema = z.object({
  id: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantityOrdered: z.number().int().positive(),
  quantityReceived: z.number().int().nonnegative().default(0),
  unitCost: z.number().nonnegative(),
});
export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;

export const PurchaseOrderSchema = z.object({
  id: z.string().uuid(),
  poNumber: z.string().min(1),
  supplierId: z.string().uuid(),
  status: PurchaseOrderStatusSchema,
  currency: z.string().default("AED"),
  totalCost: z.number().nonnegative(),
  notes: z.string().optional().nullable(),
  items: z.array(PurchaseOrderItemSchema).optional(),
});
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

export const GoodsReceiptSchema = z.object({
  id: z.string().uuid(),
  grnNumber: z.string().min(1),
  purchaseOrderId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  invoiceRef: z.string().optional().nullable(),
  receivedDate: z.string().or(z.date()),
});
export type GoodsReceipt = z.infer<typeof GoodsReceiptSchema>;
