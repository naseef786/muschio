import { z } from "zod";
import { CurrencySchema } from "./catalog";

export const OrderStateSchema = z.enum([
  "PENDING",
  "PAYMENT_PENDING",
  "AUTHORIZED",
  "PAID",
  "FULFILLING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
  "REFUNDED"
]);
export type OrderState = z.infer<typeof OrderStateSchema>;

export const AddressSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(8), // UAE/GCC format e.g. +971501234567
  email: z.string().email(),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1), // Dubai, Abu Dhabi, Riyadh, etc.
  stateOrEmirate: z.string().min(1),
  country: z.string().default("AE"), // AE, SA, QA, KW, BH, OM
  postalCode: z.string().optional().nullable(),
});
export type Address = z.infer<typeof AddressSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  variantId: z.string().uuid(),
  productNameEn: z.string(),
  productNameAr: z.string(),
  brandName: z.string(),
  sizeLabel: z.string(),
  sku: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  totalPrice: z.number().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(), // e.g. "MSC-2026-9821"
  customerId: z.string().uuid().optional().nullable(),
  guestEmail: z.string().email().optional().nullable(),
  status: OrderStateSchema,
  currency: CurrencySchema,
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  shippingAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional().nullable(),
  items: z.array(OrderItemSchema),
  paymentId: z.string().uuid().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Order = z.infer<typeof OrderSchema>;

export const CheckoutPayloadSchema = z.object({
  cartId: z.string().uuid(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentMethod: z.enum(["TABBY", "TAMARA", "CREDIT_CARD", "APPLE_PAY", "GOOGLE_PAY", "CASH_ON_DELIVERY"]),
  currency: CurrencySchema.default("AED"),
  couponCode: z.string().optional(),
  customerNotes: z.string().optional(),
});
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
